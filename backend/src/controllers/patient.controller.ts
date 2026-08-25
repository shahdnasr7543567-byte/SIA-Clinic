import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
import { Patient } from "../models/Patient.js";
import { Prescription } from "../models/Prescription.js";
import { Queue } from "../models/Queue.js";
import { Reminder } from "../models/Reminder.js";
import { Types } from "mongoose";

export const searchPatients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query;
    const queryStr = typeof q === "string" ? q.trim() : "";

    let filter: any = { clinicId: req.clinicId };

    if (queryStr) {
      filter.$or = [
        { name: { $regex: queryStr, $options: "i" } },
        { mobile: { $regex: queryStr, $options: "i" } },
      ];
    }

    const patients = await Patient.find(filter).sort({ updatedAt: -1 }).limit(30);

    const formatted = patients.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      mobile: p.mobile,
      age: p.age,
      gender: p.gender,
      allergies: p.allergies,
      chronicDiseases: p.chronicDiseases,
      notes: p.notes,
      createdAt: p.createdAt.toISOString(),
    }));

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(404).json({ success: false, error: { message: "Patient not found" } });
      return;
    }

    const patient = await Patient.findOne({ _id: id, clinicId: req.clinicId });
    if (!patient) {
      res.status(404).json({ success: false, error: { message: "Patient not found" } });
      return;
    }

    res.status(200).json({
      id: patient._id.toString(),
      name: patient.name,
      mobile: patient.mobile,
      age: patient.age,
      gender: patient.gender,
      allergies: patient.allergies,
      chronicDiseases: patient.chronicDiseases,
      notes: patient.notes,
      createdAt: patient.createdAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientMedicalInfo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(404).json({ success: false, error: { message: "Patient not found" } });
      return;
    }

    const patient = await Patient.findOne({ _id: id, clinicId: req.clinicId });
    if (!patient) {
      res.status(404).json({ success: false, error: { message: "Patient not found" } });
      return;
    }

    res.status(200).json({
      allergies: patient.allergies || [],
      chronicDiseases: patient.chronicDiseases || [],
      notes: patient.notes || "",
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(404).json({ success: false, error: { message: "Patient not found" } });
      return;
    }

    const visits = await Queue.find({
      clinicId: req.clinicId,
      patientId: id,
      status: "done",
    }).sort({ visitDate: 1 });

    const prescriptions = await Prescription.find({
      clinicId: req.clinicId,
      patientId: id,
    }).sort({ createdAt: 1 });

    const totalVisits = visits.length || prescriptions.length;
    const firstVisit = visits[0]?.visitDate || prescriptions[0]?.createdAt.toISOString().split("T")[0] || "—";
    const lastVisit =
      visits[visits.length - 1]?.visitDate ||
      prescriptions[prescriptions.length - 1]?.createdAt.toISOString().split("T")[0] ||
      "—";

    // Calculate top diagnosis
    const diagnosisCounts: Record<string, number> = {};
    prescriptions.forEach((p) => {
      if (p.diagnosis) {
        diagnosisCounts[p.diagnosis] = (diagnosisCounts[p.diagnosis] || 0) + 1;
      }
    });

    let topDiagnosis = "لا يوجد";
    let maxCount = 0;
    for (const [diag, count] of Object.entries(diagnosisCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topDiagnosis = diag;
      }
    }

    res.status(200).json({
      totalVisits,
      firstVisit,
      lastVisit,
      topDiagnosis,
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(404).json({ success: false, error: { message: "Patient not found" } });
      return;
    }

    const prescriptions = await Prescription.find({
      clinicId: req.clinicId,
      patientId: id,
    })
      .populate("doctorId", "name")
      .sort({ createdAt: -1 });

    const formatted = prescriptions.map((p) => ({
      id: p._id.toString(),
      date: p.createdAt.toISOString().split("T")[0],
      diagnosis: p.diagnosis,
      doctorName: (p.doctorId as any)?.name || "الطبيب المعالج",
      drugsCount: p.drugs.length,
      drugs: p.drugs.map((d) => `${d.name} (${d.dosage})`),
    }));

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getPatientReminders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(404).json({ success: false, error: { message: "Patient not found" } });
      return;
    }

    const reminders = await Reminder.find({
      clinicId: req.clinicId,
      patientId: id,
    }).sort({ date: 1 });

    const formatted = reminders.map((r) => ({
      id: r._id.toString(),
      preset: r.preset,
      date: r.date,
      status: r.status,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const createPatientReminder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { preset, date } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(404).json({ success: false, error: { message: "Patient not found" } });
      return;
    }

    const reminder = await Reminder.create({
      clinicId: req.clinicId,
      patientId: new Types.ObjectId(id),
      preset,
      date,
      status: "pending",
    });

    res.status(201).json({
      id: reminder._id.toString(),
      preset: reminder.preset,
      date: reminder.date,
      status: reminder.status,
    });
  } catch (error) {
    next(error);
  }
};
