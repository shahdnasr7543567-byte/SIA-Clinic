import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { AuthRequest, AuthenticatedUser } from "../types/index.js";
import { User } from "../models/User.js";
import { Types } from "mongoose";

interface JwtPayload {
  id: string;
  clinicId: string;
  email: string;
  role: "admin" | "doctor" | "receptionist";
}

export const authenticate = async (
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
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: { message: "User session is invalid or user is inactive." },
      });
      return;
    }

    req.user = {
      id: (user._id as Types.ObjectId).toString(),
      clinicId: user.clinicId,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    req.clinicId = user.clinicId;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: "Invalid or expired token." },
    });
  }
};
