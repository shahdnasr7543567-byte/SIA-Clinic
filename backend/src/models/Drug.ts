import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDrug extends Document {
  clinicId?: Types.ObjectId;
  name: string;
  genericName: string;
  form: "tablet" | "syrup" | "injection" | "capsule" | "cream" | "drops";
  defaultDosage?: string;
  commonUnits: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DrugSchema = new Schema<IDrug>(
  {
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      index: true,
    },
    name: { type: String, required: true, trim: true },
    genericName: { type: String, required: true, trim: true },
    form: {
      type: String,
      enum: ["tablet", "syrup", "injection", "capsule", "cream", "drops"],
      default: "tablet",
    },
    defaultDosage: { type: String },
    commonUnits: { type: [String], default: ["days", "weeks", "months"] },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

DrugSchema.index({ name: "text", genericName: "text" });

export const Drug = mongoose.model<IDrug>("Drug", DrugSchema);
