import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
import { Booking } from "../models/Booking.js";
import { Queue } from "../models/Queue.js";
import { Patient } from "../models/Patient.js";
import { Clinic } from "../models/Clinic.js";
import { Types } from "mongoose";

export const createOnlineBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { patientName, mobile, age, examType, date, time, paymentMethod } = req.body;

    // Resolve clinic ID (from tenant middleware)
    let clinicId = req.clinicId;
    if (!clinicId) {
      const defaultClinic = await Clinic.findOne({ subscriptionStatus: "active" });
      if (!defaultClinic) {
        res.status(400).json({ success: false, error: { message: "No active clinic available." } });
        return;
      }
      clinicId = defaultClinic._id as Types.ObjectId;
    }

    const clinic = await Clinic.findById(clinicId);
    const maxCapacity = clinic?.settings?.dailyCapacity || 50;

    // Check capacity for requested booking date
    const bookedCount = await Queue.countDocuments({
      clinicId,
      visitDate: date,
      status: { $ne: "cancelled" },
    });

    if (bookedCount >= maxCapacity) {
      // Find next available date (within 7 days)
      const nextDate = new Date(date);
      let suggestedDate = "";
      for (let i = 1; i <= 7; i++) {
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateStr = nextDate.toISOString().split("T")[0];
        const nextCount = await Queue.countDocuments({
          clinicId,
          visitDate: nextDateStr,
          status: { $ne: "cancelled" },
        });
        if (nextCount < maxCapacity) {
          suggestedDate = nextDateStr;
          break;
        }
      }

      res.status(400).json({
        success: false,
        error: {
          message: `عذراً، هذا اليوم (${date}) ممتلئ تماماً.`,
          capacityExceeded: true,
          suggestedDate: suggestedDate || "يرجى التواصل مع العيادة هاتفياً",
        },
      });
      return;
    }

    // Find or create patient
    let patient = await Patient.findOne({ clinicId, mobile });
    if (!patient) {
      patient = await Patient.create({
        clinicId,
        name: patientName,
        mobile,
        age,
        gender: "male",
      });
    }

    // Assign queue sequence for the booking date
    const lastQueue = await Queue.findOne({
      clinicId,
      visitDate: date,
    }).sort({ queueNumber: -1 });

    const queueNumber = lastQueue ? lastQueue.queueNumber + 1 : 1;

    const queueEntry = await Queue.create({
      clinicId,
      patientId: patient._id,
      queueNumber,
      status: "waiting",
      priority: "normal",
      examType: examType || "examination",
      visitDate: date,
      notes: `حجز أونلاين - الدفع: ${paymentMethod === "instapay" ? "انستاباي" : "نقدي"}`,
    });

    const booking = await Booking.create({
      clinicId,
      patientName,
      mobile,
      age,
      examType,
      date,
      time,
      paymentMethod: paymentMethod || "cash",
      paymentStatus: paymentMethod === "instapay" ? "pending" : "paid",
      status: "confirmed",
      queueId: queueEntry._id,
    });

    res.status(201).json({
      id: booking._id.toString(),
      queueNumber: queueEntry.queueNumber,
      date: booking.date,
      time: booking.time,
      paymentMethod: booking.paymentMethod,
      message: "تم تسجيل الحجز بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

export const checkCapacity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split("T")[0];
    const clinicId = req.clinicId;

    const clinic = await Clinic.findById(clinicId);
    const maxCapacity = clinic?.settings?.dailyCapacity || 50;

    const bookedCount = await Queue.countDocuments({
      clinicId,
      visitDate: date,
      status: { $ne: "cancelled" },
    });

    const isAvailable = bookedCount < maxCapacity;
    const remainingSlots = Math.max(0, maxCapacity - bookedCount);

    res.status(200).json({
      date,
      maxCapacity,
      bookedCount,
      remainingSlots,
      isAvailable,
    });
  } catch (error) {
    next(error);
  }
};
