import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReminder extends Document {
  clinicId: Types.ObjectId;
  patientId: Types.ObjectId;
  preset: "tomorrow" | "week" | "month" | "custom";
  date: string; // YYYY-MM-DD
  status: "pending" | "sent" | "dismissed";
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
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
    preset: {
      type: String,
      enum: ["tomorrow", "week", "month", "custom"],
      required: true,
    },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "sent", "dismissed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Reminder = mongoose.model<IReminder>("Reminder", ReminderSchema);
