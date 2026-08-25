import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
import { AIConversation } from "../models/AIConversation.js";
import { Patient } from "../models/Patient.js";
import { Clinic } from "../models/Clinic.js";
import { Drug } from "../models/Drug.js";
import { Queue } from "../models/Queue.js";
import crypto from "crypto";

export const chatWithAI = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, sessionId, phone } = req.body;

    const session = sessionId || crypto.randomUUID();
    const clinicId = req.clinicId;

    // Retrieve clinic info for knowledge
    const clinic = clinicId ? await Clinic.findById(clinicId) : await Clinic.findOne();
    const clinicName = clinic?.name || "عيادة سِيَا التخصصية";
    const fee = clinic?.settings?.consultationFee || 200;
    const hours = clinic?.settings?.workingHours
      ? `من ${clinic.settings.workingHours.open} إلى ${clinic.settings.workingHours.close}`
      : "من 9 صباحاً إلى 9 مساءً";

    // Build intelligent modular reply (ready for AI engineer to plug Claude/LLM pipeline)
    let reply = "";
    const lower = (message || "").toLowerCase();

    if (lower.includes("سعر") || lower.includes("تكلفة") || lower.includes("كشف") || lower.includes("أسعار")) {
      reply = `سعر الكشف في ${clinicName} هو ${fee} جنيه مصري، وسعر إعادة الكشف/الاستشارة ${clinic?.settings?.followUpFee || 100} جنيه. يمكنك الحجز أونلاين أو التوجه لمكتب الاستقبال.`;
    } else if (lower.includes("مواعيد") || lower.includes("وقت") || lower.includes("ساعة") || lower.includes("شغالين")) {
      reply = `مواعيد العمل بالعيادة: ${hours} يومياً عدا الجمعة.`;
    } else if (lower.includes("حجز") || lower.includes("احجز") || lower.includes("موعد")) {
      reply = `يمكنك حجز موعد جديد مباشرة عبر صفحة الحجز الأونلاين عبر الرابط: /book أو تزويدي باسمك ورقم هاتفك واليوم المطلوب لأساعدك.`;
    } else if (lower.includes("عنوان") || lower.includes("مكان") || lower.includes("موقع") || lower.includes("فين")) {
      reply = `عنوان العيادة: ${clinic?.address || "أسيوط - شارع الجمهورية - برج الأطباء"}، هاتف: ${clinic?.phone || "01000000000"}.`;
    } else if (lower.includes("طبيب") || lower.includes("دكتور") || lower.includes("تخصص")) {
      reply = `${clinicName} تضم نخبة من أفضل الأطباء والاستشاريين في الباطنة والقلب والأطفال والجراحة.`;
    } else {
      reply = `أهلاً بك في ${clinicName}! أنا المساعد الذكي للعيادة. كيف يمكنني مساعدتك اليوم؟ (يمكنك الاستفسار عن المواعيد، الأسعار، الأطباء، أو طلب حجز موعد).`;
    }

    // Persist conversation to database
    let conversation = await AIConversation.findOne({ sessionId: session });
    if (!conversation) {
      conversation = new AIConversation({
        clinicId: clinic?._id,
        sessionId: session,
        patientMobile: phone,
        messages: [],
      });
    }

    conversation.messages.push({
      sender: "patient",
      text: message,
      timestamp: new Date(),
    });

    conversation.messages.push({
      sender: "agent",
      text: reply,
      timestamp: new Date(),
    });

    await conversation.save();

    // Response matching standard format { reply, sessionId }
    res.status(200).json({
      reply,
      sessionId: session,
    });
  } catch (error) {
    next(error);
  }
};

export const lookupPatientForAI = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const phone = req.query.phone as string;
    if (!phone) {
      res.status(400).json({ success: false, error: { message: "Phone query is required" } });
      return;
    }

    const patient = await Patient.findOne({ mobile: phone });
    if (!patient) {
      res.status(404).json({ success: false, error: { message: "Patient not found" } });
      return;
    }

    res.status(200).json({
      id: patient._id.toString(),
      name: patient.name,
      mobile: patient.mobile,
      age: patient.age,
      allergies: patient.allergies,
      chronicDiseases: patient.chronicDiseases,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailabilityForAI = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const clinic = await Clinic.findOne({ subscriptionStatus: "active" });

    const maxCapacity = clinic?.settings?.dailyCapacity || 50;
    const currentBooked = await Queue.countDocuments({
      clinicId: clinic?._id,
      visitDate: today,
      status: { $ne: "cancelled" },
    });

    res.status(200).json({
      clinicName: clinic?.name || "عيادة سِيَا",
      date: today,
      workingHours: clinic?.settings?.workingHours,
      consultationFee: clinic?.settings?.consultationFee,
      isAvailableToday: currentBooked < maxCapacity,
      remainingSlotsToday: Math.max(0, maxCapacity - currentBooked),
    });
  } catch (error) {
    next(error);
  }
};
