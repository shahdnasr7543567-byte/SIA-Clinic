import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
import { Queue } from "../models/Queue.js";
import { Patient } from "../models/Patient.js";
import { Clinic } from "../models/Clinic.js";
import { Types } from "mongoose";

const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const getReceptionStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const today = getTodayString();

    const queueEntries = await Queue.find({
      clinicId: req.clinicId,
      visitDate: today,
    });

    const clinic = await Clinic.findById(req.clinicId);
    const consultationFee = clinic?.settings?.consultationFee || 200;

    const totalPatients = queueEntries.length;
    const waiting = queueEntries.filter((q) => q.status === "waiting").length;
    const done = queueEntries.filter((q) => q.status === "done").length;
    const revenue = done * consultationFee;

    res.status(200).json({
      totalPatients,
      waiting,
      done,
      revenue,
    });
  } catch (error) {
    next(error);
  }
};

export const getReceptionQueue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const today = getTodayString();

    const queue = await Queue.find({
      clinicId: req.clinicId,
      visitDate: today,
    })
      .populate("patientId")
      .sort({ queueNumber: 1 });

    const formatted = queue.map((entry) => {
      const patient = entry.patientId as any;
      return {
        id: entry._id.toString(),
        queueNumber: entry.queueNumber,
        patient: patient
          ? {
              id: patient._id.toString(),
              name: patient.name,
              mobile: patient.mobile,
              age: patient.age,
              gender: patient.gender,
              allergies: patient.allergies || [],
              chronicDiseases: patient.chronicDiseases || [],
              notes: patient.notes,
              createdAt: patient.createdAt?.toISOString(),
            }
          : {
              id: "",
              name: "مريض غير معروف",
              mobile: "",
              age: 0,
              gender: "male",
            },
        priority: entry.priority,
        status: entry.status,
        examType: entry.examType,
        enteredAt: entry.enteredAt.toISOString(),
        notes: entry.notes,
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const addPatientToQueue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, mobile, age, gender, priority, examType, notes } = req.body;
    const today = getTodayString();

    // Check clinic daily capacity
    const clinic = await Clinic.findById(req.clinicId);
    const maxCapacity = clinic?.settings?.dailyCapacity || 50;

    const currentCount = await Queue.countDocuments({
      clinicId: req.clinicId,
      visitDate: today,
      status: { $ne: "cancelled" },
    });

    if (currentCount >= maxCapacity) {
      res.status(400).json({
        success: false,
        error: {
          message: `عذراً، اكتملت السعة اليومية للعيادة (${maxCapacity} كشف). يرجى الحجز في يوم آخر.`,
          capacityExceeded: true,
        },
      });
      return;
    }

    // Find or create patient record
    let patient = await Patient.findOne({ clinicId: req.clinicId, mobile });
    if (!patient) {
      patient = await Patient.create({
        clinicId: req.clinicId,
        name,
        mobile,
        age,
        gender: gender || "male",
        notes,
      });
    } else {
      // update details if provided
      patient.name = name;
      patient.age = age;
      if (gender) patient.gender = gender;
      await patient.save();
    }

    // Next queue number for today
    const lastQueue = await Queue.findOne({
      clinicId: req.clinicId,
      visitDate: today,
    }).sort({ queueNumber: -1 });

    const queueNumber = lastQueue ? lastQueue.queueNumber + 1 : 1;

    const queueEntry = await Queue.create({
      clinicId: req.clinicId,
      patientId: patient._id,
      queueNumber,
      status: "waiting",
      priority: priority || "normal",
      examType: examType || "examination",
      visitDate: today,
      enteredAt: new Date(),
      notes,
    });

    res.status(201).json({
      id: patient._id.toString(),
      name: patient.name,
      mobile: patient.mobile,
      age: patient.age,
      gender: patient.gender,
      allergies: patient.allergies,
      chronicDiseases: patient.chronicDiseases,
      notes: patient.notes,
      queueEntryId: queueEntry._id.toString(),
      queueNumber: queueEntry.queueNumber,
      createdAt: patient.createdAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateQueueStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(404).json({ success: false, error: { message: "Queue entry not found" } });
      return;
    }

    const queueEntry = await Queue.findOne({ _id: id, clinicId: req.clinicId }).populate(
      "patientId"
    );

    if (!queueEntry) {
      res.status(404).json({ success: false, error: { message: "Queue entry not found" } });
      return;
    }

    queueEntry.status = status;
    if (status === "done") {
      queueEntry.completedAt = new Date();
    } else if (status === "cancelled") {
      queueEntry.cancelledAt = new Date();
    }

    await queueEntry.save();

    const patient = queueEntry.patientId as any;

    res.status(200).json({
      id: queueEntry._id.toString(),
      queueNumber: queueEntry.queueNumber,
      patient: patient
        ? {
            id: patient._id.toString(),
            name: patient.name,
            mobile: patient.mobile,
            age: patient.age,
            gender: patient.gender,
            allergies: patient.allergies || [],
            chronicDiseases: patient.chronicDiseases || [],
            notes: patient.notes,
          }
        : null,
      priority: queueEntry.priority,
      status: queueEntry.status,
      examType: queueEntry.examType,
      enteredAt: queueEntry.enteredAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
