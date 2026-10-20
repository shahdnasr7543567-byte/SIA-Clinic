import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { AuthRequest } from "../types/index.js";
import { Patient } from "../models/Patient.js";
import { Types } from "mongoose";

interface PatientJwtPayload {
  id: string;
  clinicId: string;
  mobile: string;
  role: "patient";
}

export const authenticatePatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: { message: "Authentication required. Missing token." },
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as PatientJwtPayload;

    if (!decoded.id || !Types.ObjectId.isValid(decoded.id)) {
      res.status(401).json({
        success: false,
        error: { message: "Invalid session token." },
      });
      return;
    }

    const patient = await Patient.findById(decoded.id);
    if (!patient) {
      res.status(401).json({
        success: false,
        error: { message: "Patient session is invalid." },
      });
      return;
    }

    req.patient = {
      id: (patient._id as Types.ObjectId).toString(),
      clinicId: patient.clinicId,
      mobile: patient.mobile,
      name: patient.name,
      role: "patient",
    };
    req.clinicId = patient.clinicId;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: "Invalid or expired token." },
    });
  }
};
