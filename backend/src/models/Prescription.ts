import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPrescriptionDrug {
  drugId?: Types.ObjectId;
  name: string;
  genericName?: string;
  form: string;
  dosage: string;
  frequency: string;
  duration: string;
  unit: string;
  instructions?: string;
}

export interface IPrescription extends Document {
  clinicId: Types.ObjectId;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  queueId?: Types.ObjectId;
  prescriptionNumber: string;
  diagnosis: string;
  drugs: IPrescriptionDrug[];
  notes?: string;
  qrHash: string;
  sentToPharmacy: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionDrugSchema = new Schema<IPrescriptionDrug>(
  {
    drugId: { type: Schema.Types.ObjectId, ref: "Drug" },
    name: { type: String, required: true },
    genericName: { type: String },
    form: { type: String, default: "tablet" },
    dosage: { type: String, required: true },
    frequency: { type: String, default: "3 times daily" },
    duration: { type: String, required: true },
    unit: { type: String, default: "days" },
    instructions: { type: String },
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescription>(
  {
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    queueId: {
      type: Schema.Types.ObjectId,
      ref: "Queue",
    },
    prescriptionNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    diagnosis: { type: String, required: true, trim: true },
    drugs: { type: [PrescriptionDrugSchema], default: [] },
    notes: { type: String, trim: true },
    qrHash: { type: String, required: true, index: true },
    sentToPharmacy: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

PrescriptionSchema.index({ clinicId: 1, createdAt: -1 });

export const Prescription = mongoose.model<IPrescription>(
  "Prescription",
  PrescriptionSchema
);
