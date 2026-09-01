import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQueue extends Document {
  clinicId: Types.ObjectId;
  patientId: Types.ObjectId;
  queueNumber: number;
  status: "waiting" | "done" | "cancelled";
  priority: "normal" | "urgent" | "critical";
  examType: "examination" | "followup" | "consultation";
  visitDate: string; // YYYY-MM-DD
  enteredAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QueueSchema = new Schema<IQueue>(
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
    },
    queueNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ["waiting", "done", "cancelled"],
      default: "waiting",
      index: true,
    },
    priority: {
      type: String,
      enum: ["normal", "urgent", "critical"],
      default: "normal",
    },
    examType: {
      type: String,
      enum: ["examination", "followup", "consultation"],
      default: "examination",
    },
    visitDate: { type: String, required: true, index: true },
    enteredAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

QueueSchema.index({ clinicId: 1, visitDate: 1, queueNumber: 1 });

export const Queue = mongoose.model<IQueue>("Queue", QueueSchema);
