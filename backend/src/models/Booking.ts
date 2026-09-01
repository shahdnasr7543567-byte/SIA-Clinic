import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBooking extends Document {
  clinicId: Types.ObjectId;
  patientName: string;
  mobile: string;
  age: number;
  examType: "examination" | "followup" | "consultation";
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: "cash" | "instapay";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: "confirmed" | "cancelled" | "completed";
  queueId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true,
    },
    patientName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    examType: {
      type: String,
      enum: ["examination", "followup", "consultation"],
      default: "examination",
    },
    date: { type: String, required: true, index: true },
    time: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "instapay"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    queueId: { type: Schema.Types.ObjectId, ref: "Queue" },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
