import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Patient } from "../models/Patient.js";
import { Clinic } from "../models/Clinic.js";
import { ENV } from "../config/env.js";
import { getFirebaseAuth } from "../config/firebase.js";

/**
 * Normalizes an Egyptian phone number to E.164 (+20...) format for reliable matching.
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("20")) return `+${digits}`;
  if (digits.startsWith("0")) return `+20${digits.slice(1)}`;
  return `+20${digits}`;
}

const generatePatientToken = (patient: any): string => {
  return jwt.sign(
    {
      id: patient._id.toString(),
      clinicId: patient.clinicId.toString(),
      mobile: patient.mobile,
      role: "patient",
    },
    ENV.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

export const registerPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      fullName,
      mobile,
      phone,
      age,
      password,
      clinicCode,
      firebaseIdToken,
    } = req.body;

    const patientName = (name || fullName || "").trim();
    const rawMobile = (mobile || phone || "").trim();

    // 1. Token validation
    if (!firebaseIdToken) {
      res.status(400).json({
        success: false,
        code: "PHONE_TOKEN_REQUIRED",
        message: "التحقق من رقم الموبايل مطلوب",
        error: {
          code: "PHONE_TOKEN_REQUIRED",
          message: "التحقق من رقم الموبايل مطلوب",
        },
      });
      return;
    }

    if (!rawMobile) {
      res.status(400).json({
        success: false,
        error: { message: "رقم الموبايل مطلوب" },
      });
      return;
    }

    // 2. Verify Firebase ID Token
    let verifiedPhone: string | undefined;
    let firebaseUid: string | undefined;

    const firebaseAuth = getFirebaseAuth();

    // Development fallback mock token if Firebase is not yet configured with secret keys
    if (
      !firebaseAuth &&
      process.env.NODE_ENV === "development" &&
      firebaseIdToken.startsWith("mock-")
    ) {
      verifiedPhone = normalizePhone(rawMobile);
      firebaseUid = "mock-firebase-uid-" + Date.now();
    } else if (!firebaseAuth) {
      res.status(500).json({
        success: false,
        code: "FIREBASE_NOT_CONFIGURED",
        message: "خدمة التحقق من الموبايل (Firebase) غير مهيأة بالسيرفر. يرجى إضافة مفاتيح الخدمة في .env",
        error: {
          code: "FIREBASE_NOT_CONFIGURED",
          message: "خدمة التحقق من الموبايل (Firebase) غير مهيأة بالسيرفر. يرجى إضافة مفاتيح الخدمة في .env",
        },
      });
      return;
    } else {
      try {
        const decoded = await firebaseAuth.verifyIdToken(firebaseIdToken);
        verifiedPhone = decoded.phone_number;
        firebaseUid = decoded.uid;
      } catch (err: any) {
        if (
          err?.code === "auth/id-token-expired" ||
          err?.errorInfo?.code === "auth/id-token-expired"
        ) {
          res.status(401).json({
            success: false,
            code: "PHONE_TOKEN_EXPIRED",
            message: "انتهت صلاحية التحقق، أعد إرسال الكود",
            error: {
              code: "PHONE_TOKEN_EXPIRED",
              message: "انتهت صلاحية التحقق، أعد إرسال الكود",
            },
          });
          return;
        }

        res.status(401).json({
          success: false,
          code: "PHONE_VERIFICATION_INVALID",
          message: "فشل التحقق من رقم الموبايل، حاول مرة أخرى",
          error: {
            code: "PHONE_VERIFICATION_INVALID",
            message: "فشل التحقق من رقم الموبايل، حاول مرة أخرى",
          },
        });
        return;
      }
    }

    // 3. Ensure phone_number is in token
    if (!verifiedPhone) {
      res.status(401).json({
        success: false,
        code: "PHONE_NOT_VERIFIED",
        message: "رقم الموبايل غير متحقق منه",
        error: {
          code: "PHONE_NOT_VERIFIED",
          message: "رقم الموبايل غير متحقق منه",
        },
      });
      return;
    }

    // 4. Compare normalized phone numbers
    const normVerified = normalizePhone(verifiedPhone);
    const normInput = normalizePhone(rawMobile);
    if (normVerified !== normInput) {
      res.status(400).json({
        success: false,
        code: "PHONE_MISMATCH",
        message: "الرقم لا يطابق الرقم المتحقق منه",
        error: {
          code: "PHONE_MISMATCH",
          message: "الرقم لا يطابق الرقم المتحقق منه",
        },
      });
      return;
    }

    // 5. Clinic lookup
    let clinic = null;
    if (clinicCode) {
      clinic = await Clinic.findOne({ code: clinicCode.toLowerCase() });
    }
    if (!clinic) {
      clinic = await Clinic.findOne({ subscriptionStatus: "active" });
    }
    if (!clinic) {
      res.status(404).json({
        success: false,
        error: { message: "العيادة غير موجودة أو غير نشطة" },
      });
      return;
    }

    // 6. Check existing patient
    // Look up by either raw mobile or normalized form
    const existingPatient = await Patient.findOne({
      clinicId: clinic._id,
      $or: [{ mobile: rawMobile }, { mobile: normInput }],
    });

    if (existingPatient && existingPatient.passwordHash) {
      res.status(409).json({
        success: false,
        code: "PHONE_ALREADY_EXISTS",
        message: "رقم الموبايل ده مسجل بالفعل",
        error: {
          code: "PHONE_ALREADY_EXISTS",
          message: "رقم الموبايل ده مسجل بالفعل",
        },
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let patient = existingPatient;
    if (patient) {
      // Existing patient created by receptionist, now registering account
      patient.name = patientName || patient.name;
      patient.age = age !== undefined ? age : patient.age;
      patient.mobile = rawMobile;
      patient.passwordHash = passwordHash;
      patient.firebaseUid = firebaseUid;
      await patient.save();
    } else {
      patient = await Patient.create({
        clinicId: clinic._id,
        name: patientName,
        mobile: rawMobile,
        age: age || 0,
        gender: "male",
        passwordHash,
        firebaseUid,
      });
    }

    const token = generatePatientToken(patient);

    res.status(201).json({
      patient: {
        id: patient._id.toString(),
        clinicId: patient.clinicId.toString(),
        name: patient.name,
        mobile: patient.mobile,
        age: patient.age,
        createdAt: patient.createdAt.toISOString(),
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const loginPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { mobile, phone, password } = req.body;
    const rawMobile = (mobile || phone || "").trim();

    if (!rawMobile || !password) {
      res.status(400).json({
        success: false,
        error: { message: "رقم الموبايل وكلمة المرور مطلوبان" },
      });
      return;
    }

    const normMobile = normalizePhone(rawMobile);

    const patient = await Patient.findOne({
      $or: [{ mobile: rawMobile }, { mobile: normMobile }],
      passwordHash: { $exists: true, $ne: "" },
    });

    if (!patient) {
      res.status(401).json({
        success: false,
        error: { message: "رقم الموبايل أو كلمة المرور غلط" },
      });
      return;
    }

    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: { message: "رقم الموبايل أو كلمة المرور غلط" },
      });
      return;
    }

    const token = generatePatientToken(patient);

    res.status(200).json({
      patient: {
        id: patient._id.toString(),
        clinicId: patient.clinicId.toString(),
        name: patient.name,
        mobile: patient.mobile,
        age: patient.age,
        createdAt: patient.createdAt.toISOString(),
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
