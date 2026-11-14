import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAIMessage {
  sender: "patient" | "agent" | "system";
  text: string;
  intent?: string;
  timestamp: Date;
}

export interface IAIConversation extends Document {
  clinicId?: Types.ObjectId;
  sessionId: string;
  patientMobile?: string;
  messages: IAIMessage[];
  status: "active" | "escalated_to_human" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const AIMessageSchema = new Schema<IAIMessage>(
  {
    sender: { type: String, enum: ["patient", "agent", "system"], required: true },
    text: { type: String, required: true },
    intent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AIConversationSchema = new Schema<IAIConversation>(
  {
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      index: true,
    },
    sessionId: { type: String, required: true, unique: true, index: true },
    patientMobile: { type: String, index: true },
    messages: { type: [AIMessageSchema], default: [] },
    status: {
      type: String,
      enum: ["active", "escalated_to_human", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const AIConversation = mongoose.model<IAIConversation>(
  "AIConversation",
  AIConversationSchema
);
