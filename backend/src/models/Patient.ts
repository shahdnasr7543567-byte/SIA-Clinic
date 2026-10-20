import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IPatient extends Document {
  clinicId: Types.ObjectId;
  name: string;
  mobile: string;
  age: number;
  gender: "male" | "female";
  allergies: string[];
  chronicDiseases: string[];
  notes?: string;
  passwordHash?: string;
  firebaseUid?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const PatientSchema = new Schema<IPatient>(
  {
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female"], default: "male" },
    allergies: { type: [String], default: [] },
    chronicDiseases: { type: [String], default: [] },
    notes: { type: String, trim: true },
    passwordHash: { type: String },
    firebaseUid: { type: String },
  },
  {
    timestamps: true,
  }
);

PatientSchema.index({ clinicId: 1, mobile: 1 });
PatientSchema.index({ clinicId: 1, name: "text" });

PatientSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const Patient = mongoose.model<IPatient>("Patient", PatientSchema);
