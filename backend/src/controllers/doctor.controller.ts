import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
import { Queue } from "../models/Queue.js";
import { Prescription } from "../models/Prescription.js";
import { Patient } from "../models/Patient.js";
import { Clinic } from "../models/Clinic.js";
import { Types } from "mongoose";
import crypto from "crypto";

const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const getDoctorStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const today = getTodayString();

    const todayQueue = await Queue.find({
      clinicId: req.clinicId,
      visitDate: today,
    });

    const prescriptionsCount = await Prescription.countDocuments({
      clinicId: req.clinicId,
      doctorId: req.user?.id,
    });

    const clinic = await Clinic.findById(req.clinicId);
    const consultationFee = clinic?.settings?.consultationFee || 200;

    const completedToday = todayQueue.filter((q) => q.status === "done").length;
    const revenue = completedToday * consultationFee;

    res.status(200).json({
      patients: todayQueue.filter((q) => q.status === "waiting").length,
      prescriptions: prescriptionsCount,
      revenue,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorQueue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const today = getTodayString();

    const queue = await Queue.find({
      clinicId: req.clinicId,
      visitDate: today,
      status: "waiting",
    })
      .populate("patientId")
      .sort({
        // Sort priority: critical first, then urgent, then normal, then queueNumber
        priority: -1,
        queueNumber: 1,
      });

    const priorityWeight: Record<string, number> = {
      critical: 1,
      urgent: 2,
      normal: 3,
    };

    // Sort in-memory to ensure strict priority ordering
    queue.sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 3;
      const weightB = priorityWeight[b.priority] || 3;
      if (weightA !== weightB) return weightA - weightB;
      return a.queueNumber - b.queueNumber;
    });

    const formatted = queue.map((entry) => {
      const patient = entry.patientId as any;
      return {
        id: entry._id.toString(),
        name: patient?.name || "مريض غير معروف",
        mobile: patient?.mobile || "",
        age: patient?.age,
        gender: patient?.gender,
        priority: entry.priority,
        examType: entry.examType,
        queueNumber: entry.queueNumber,
        patientId: patient?._id?.toString() || "",
        enteredAt: entry.enteredAt.toISOString(),
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const createPrescription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { patientId, queueId, diagnosis, drugs, notes } = req.body;

    if (!Types.ObjectId.isValid(patientId)) {
      res.status(400).json({ success: false, error: { message: "Invalid patient ID" } });
      return;
    }

    const patient = await Patient.findOne({ _id: patientId, clinicId: req.clinicId });
    if (!patient) {
      res.status(404).json({ success: false, error: { message: "Patient not found" } });
      return;
    }

    // Generate unique human-readable prescription number
    const count = await Prescription.countDocuments({ clinicId: req.clinicId });
    const todayStr = getTodayString().replace(/-/g, "");
    const prescriptionNumber = `RX-${todayStr}-${String(count + 1).padStart(3, "0")}`;

    // Generate QR verification hash
    const qrHash = crypto
      .createHash("sha256")
      .update(`${patientId}-${Date.now()}-${prescriptionNumber}`)
      .digest("hex")
      .substring(0, 24);

    const prescription = await Prescription.create({
      clinicId: req.clinicId,
      patientId: new Types.ObjectId(patientId),
      doctorId: new Types.ObjectId(req.user?.id),
      queueId: queueId && Types.ObjectId.isValid(queueId) ? new Types.ObjectId(queueId) : undefined,
      prescriptionNumber,
      diagnosis,
      drugs: drugs || [],
      notes,
      qrHash,
      sentToPharmacy: false,
    });

    // If queueId is provided, mark queue entry as done
    if (queueId && Types.ObjectId.isValid(queueId)) {
      await Queue.findByIdAndUpdate(queueId, {
        status: "done",
        completedAt: new Date(),
      });
    }

    res.status(201).json({
      id: prescription._id.toString(),
      prescriptionNumber: prescription.prescriptionNumber,
      patientId: prescription.patientId.toString(),
      doctorId: prescription.doctorId.toString(),
      diagnosis: prescription.diagnosis,
      drugs: prescription.drugs,
      notes: prescription.notes,
      qrHash: prescription.qrHash,
      createdAt: prescription.createdAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(404).json({ success: false, error: { message: "Prescription not found" } });
      return;
    }

    const prescription = await Prescription.findOne({
      _id: id,
      clinicId: req.clinicId,
    })
      .populate("patientId")
      .populate("doctorId", "name specialty");

    if (!prescription) {
      res.status(404).json({ success: false, error: { message: "Prescription not found" } });
      return;
    }

    res.status(200).json({
      id: prescription._id.toString(),
      prescriptionNumber: prescription.prescriptionNumber,
      patient: prescription.patientId,
      doctor: prescription.doctorId,
      diagnosis: prescription.diagnosis,
      drugs: prescription.drugs,
      notes: prescription.notes,
      qrHash: prescription.qrHash,
      sentToPharmacy: prescription.sentToPharmacy,
      createdAt: prescription.createdAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const sendToPharmacy = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(404).json({ success: false, error: { message: "Prescription not found" } });
      return;
    }

    const prescription = await Prescription.findOneAndUpdate(
      { _id: id, clinicId: req.clinicId },
      { sentToPharmacy: true },
      { new: true }
    );

    if (!prescription) {
      res.status(404).json({ success: false, error: { message: "Prescription not found" } });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Prescription dispatched to partner pharmacy successfully.",
    });
  } catch (error) {
    next(error);
  }
};
