import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
import { Clinic } from "../models/Clinic.js";
import { Types } from "mongoose";

export const requireTenant = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.clinicId) {
    res.status(400).json({
      success: false,
      error: { message: "Tenant context (clinicId) is missing from request." },
    });
    return;
  }
  next();
};

/**
 * For public routes (like booking or public chat), resolves clinic by slug or default clinic.
 */
export const resolvePublicTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clinicHeader = req.headers["x-clinic-id"] as string | undefined;
    const clinicCode = req.query.clinic as string | undefined;

    if (clinicHeader && Types.ObjectId.isValid(clinicHeader)) {
      req.clinicId = new Types.ObjectId(clinicHeader);
      return next();
    }

    if (clinicCode) {
      const clinic = await Clinic.findOne({ code: clinicCode.toLowerCase() });
      if (clinic) {
        req.clinicId = clinic._id as Types.ObjectId;
        return next();
      }
    }

    // Fallback: Default to first active clinic if single-clinic setup
    const defaultClinic = await Clinic.findOne({ subscriptionStatus: "active" });
    if (defaultClinic) {
      req.clinicId = defaultClinic._id as Types.ObjectId;
    }

    next();
  } catch (error) {
    next(error);
  }
};
