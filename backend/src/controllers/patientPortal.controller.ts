import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
import { Queue } from "../models/Queue.js";
import { Booking } from "../models/Booking.js";
import { Prescription } from "../models/Prescription.js";
import { Patient } from "../models/Patient.js";
import { Types } from "mongoose";

const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0];
};

/**
 * GET /patient/queue-status
 * Returns real-time queue position for the logged-in patient today.
 */
export const getQueueStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patientId = req.patient?.id;
    const clinicId = req.clinicId;

    if (!patientId || !clinicId) {
      res.status(401).json({ success: false, error: { message: "Unauthorized" } });
      return;
    }

    const today = getTodayString();

    // Check if patient is currently waiting in today's queue
    const myQueueEntry = await Queue.findOne({
      clinicId,
      patientId: new Types.ObjectId(patientId),
      visitDate: today,
      status: "waiting",
    });

    if (!myQueueEntry) {
      res.status(200).json({ inQueue: false });
      return;
    }

    // Retrieve all waiting entries for today in this clinic
    const todayQueue = await Queue.find({
      clinicId,
      visitDate: today,
      status: "waiting",
    });

    // Priority ordering matches doctor queue: Critical (1) > Urgent (2) > Normal (3), then queueNumber
    const priorityWeight: Record<string, number> = {
      critical: 1,
      urgent: 2,
      normal: 3,
    };

    todayQueue.sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 3;
      const weightB = priorityWeight[b.priority] || 3;
      if (weightA !== weightB) return weightA - weightB;
      return a.queueNumber - b.queueNumber;
    });

    const myIndex = todayQueue.findIndex(
      (entry) => entry._id.toString() === myQueueEntry._id.toString()
    );

    const peopleAhead = myIndex >= 0 ? myIndex : 0;
    // Estimated average consultation duration: ~15 mins per patient ahead
    const estimatedWaitMinutes = peopleAhead * 15;

    res.status(200).json({
      inQueue: true,
      queueNumber: myQueueEntry.queueNumber,
      peopleAhead,
      estimatedWaitMinutes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /patient/bookings
 * Returns booking history for the logged-in patient.
 */
export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patientMobile = req.patient?.mobile;
    const clinicId = req.clinicId;

    const bookings = await Booking.find({
      clinicId,
      mobile: patientMobile,
    }).sort({ date: -1, time: -1 });

    const formatted = bookings.map((b) => ({
      id: b._id.toString(),
      patientName: b.patientName,
      mobile: b.mobile,
      age: b.age,
      examType: b.examType,
      date: b.date,
      time: b.time,
      paymentMethod: b.paymentMethod,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    }));

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /patient/prescriptions
 * Returns digital prescriptions for the logged-in patient.
 */
export const getMyPrescriptions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patientId = req.patient?.id;
    const clinicId = req.clinicId;

    const prescriptions = await Prescription.find({
      clinicId,
      patientId: new Types.ObjectId(patientId),
    }).sort({ createdAt: -1 });

    const formatted = prescriptions.map((p) => ({
      id: p._id.toString(),
      prescriptionNumber: p.prescriptionNumber,
      patientId: p.patientId.toString(),
      doctorId: p.doctorId.toString(),
      diagnosis: p.diagnosis,
      drugs: p.drugs,
      notes: p.notes,
      qrHash: p.qrHash,
      createdAt: p.createdAt.toISOString(),
    }));

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /patient/prescriptions/:id
 */
export const getMyPrescriptionById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const patientId = req.patient?.id;
    const clinicId = req.clinicId;

    if (!Types.ObjectId.isValid(id)) {
      res.status(404).json({ success: false, error: { message: "Prescription not found" } });
      return;
    }

    const p = await Prescription.findOne({
      _id: id,
      clinicId,
      patientId: new Types.ObjectId(patientId),
    });

    if (!p) {
      res.status(404).json({ success: false, error: { message: "Prescription not found" } });
      return;
    }

    res.status(200).json({
      id: p._id.toString(),
      prescriptionNumber: p.prescriptionNumber,
      patientId: p.patientId.toString(),
      doctorId: p.doctorId.toString(),
      diagnosis: p.diagnosis,
      drugs: p.drugs,
      notes: p.notes,
      qrHash: p.qrHash,
      createdAt: p.createdAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /patient/medical-profile
 */
export const getMyMedicalProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patientId = req.patient?.id;
    const patient = await Patient.findById(patientId);

    if (!patient) {
      res.status(404).json({ success: false, error: { message: "Patient not found" } });
      return;
    }

    res.status(200).json({
      age: patient.age,
      chronicDiseases: patient.chronicDiseases || [],
      allergies: patient.allergies || [],
    });
  } catch (error) {
    next(error);
  }
};
