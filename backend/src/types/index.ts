import { Request } from "express";
import { Types } from "mongoose";

export interface AuthenticatedUser {
  id: string;
  clinicId: Types.ObjectId;
  email: string;
  name: string;
  role: "admin" | "doctor" | "receptionist";
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  clinicId?: Types.ObjectId;
}
