import { Request } from "express";
import { Types } from "mongoose";

export interface AuthenticatedUser {
  id: string;
  clinicId: Types.ObjectId;
  email: string;
  name: string;
  role: "admin" | "doctor" | "receptionist";
}

export interface AuthenticatedPatient {
  id: string;
  clinicId: Types.ObjectId;
  mobile: string;
  name: string;
  role: "patient";
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  patient?: AuthenticatedPatient;
  clinicId?: Types.ObjectId;
}
