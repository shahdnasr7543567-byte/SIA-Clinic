import mongoose, { Schema, Document } from "mongoose";

export interface IClinic extends Document {
  name: string;
  code: string;
  phone: string;
  address?: string;
  subscriptionPlan: "trial" | "basic" | "premium" | "enterprise";
  subscriptionStatus: "active" | "past_due" | "cancelled";
  settings: {
    dailyCapacity: number;
    workingHours: {
      open: string;
      close: string;
    };
    consultationFee: number;
    followUpFee: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema = new Schema<IClinic>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    subscriptionPlan: {
      type: String,
      enum: ["trial", "basic", "premium", "enterprise"],
      default: "basic",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "past_due", "cancelled"],
      default: "active",
    },
    settings: {
      dailyCapacity: { type: Number, default: 50 },
      workingHours: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "21:00" },
      },
      consultationFee: { type: Number, default: 200 },
      followUpFee: { type: Number, default: 100 },
    },
  },
  {
    timestamps: true,
  }
);

export const Clinic = mongoose.model<IClinic>("Clinic", ClinicSchema);
