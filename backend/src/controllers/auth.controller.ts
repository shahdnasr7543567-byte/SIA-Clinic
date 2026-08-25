import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Clinic } from "../models/Clinic.js";
import { ENV } from "../config/env.js";
import { AuthRequest } from "../types/index.js";

const generateToken = (user: any): string => {
  return jwt.sign(
    {
      id: user._id.toString(),
      clinicId: user.clinicId.toString(),
      email: user.email,
      role: user.role,
    },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN as any }
  );
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role, clinicName, clinicCode, specialty, phone } = req.body;

    // Find or create clinic
    let clinic = null;
    if (clinicCode) {
      clinic = await Clinic.findOne({ code: clinicCode.toLowerCase() });
    }

    if (!clinic) {
      const generatedCode = (clinicCode || clinicName || "sia-clinic")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");

      const existingClinic = await Clinic.findOne({ code: generatedCode });
      if (existingClinic) {
        clinic = existingClinic;
      } else {
        clinic = await Clinic.create({
          name: clinicName || "عيادة سِيَا التخصصية",
          code: generatedCode,
          phone: phone || "01000000000",
          subscriptionPlan: "basic",
          subscriptionStatus: "active",
        });
      }
    }

    // Check if email already registered in this clinic
    const existingUser = await User.findOne({ clinicId: clinic._id, email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: { message: "An account with this email already exists." },
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      clinicId: clinic._id,
      name,
      email,
      passwordHash,
      role: role || "receptionist",
      phone,
      specialty,
      isActive: true,
    });

    const token = generateToken(user);

    // Format response matching frontend AuthResponse contract: { user, token }
    res.status(201).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId.toString(),
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: "Invalid email or password." },
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: { message: "Invalid email or password." },
      });
      return;
    }

    const token = generateToken(user);

    res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId.toString(),
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Return success message even if not found to prevent user enumeration
    res.status(200).json({
      message: "If an account exists with this email, password reset instructions have been sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized" } });
      return;
    }

    const user = await User.findById(req.user.id).select("-passwordHash");
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
