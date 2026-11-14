import { z } from "zod";

// Egyptian phone number regex (010, 011, 012, 015 + 8 digits, or with +20 prefix)
const egyptianPhoneRegex = /^(\+201|01)[0125][0-9]{8}$/;

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "doctor", "receptionist"]).default("receptionist"),
  clinicName: z.string().optional(),
  clinicCode: z.string().optional(),
  specialty: z.string().optional(),
  phone: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const createPatientSchema = z.object({
  name: z.string().min(2, "Patient name is required"),
  mobile: z.string().regex(egyptianPhoneRegex, "Valid Egyptian mobile number is required (e.g. 01012345678)"),
  age: z.coerce.number().int().min(0).max(120),
  gender: z.enum(["male", "female"]).default("male"),
  allergies: z.array(z.string()).optional().default([]),
  chronicDiseases: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
});

export const addQueuePatientSchema = z.object({
  name: z.string().min(2, "Patient name is required"),
  mobile: z.string().regex(egyptianPhoneRegex, "Valid Egyptian mobile number is required"),
  age: z.coerce.number().int().min(0).max(120),
  gender: z.enum(["male", "female"]).default("male"),
  priority: z.enum(["normal", "urgent", "critical"]).default("normal"),
  examType: z.enum(["examination", "followup", "consultation"]).default("examination"),
  notes: z.string().optional(),
});

export const updateQueueStatusSchema = z.object({
  status: z.enum(["waiting", "done", "cancelled"]),
});

export const createReminderSchema = z.object({
  preset: z.enum(["tomorrow", "week", "month", "custom"]),
  date: z.string().min(1, "Date is required"),
});

export const prescriptionDrugSchema = z.object({
  drugId: z.string().optional(),
  name: z.string().min(1, "Drug name is required"),
  genericName: z.string().optional(),
  form: z.string().default("tablet"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().default("3 times daily"),
  duration: z.string().min(1, "Duration is required"),
  unit: z.string().default("days"),
  instructions: z.string().optional(),
});

export const createPrescriptionSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  queueId: z.string().optional(),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  drugs: z.array(prescriptionDrugSchema).default([]),
  notes: z.string().optional(),
});

export const onlineBookingSchema = z.object({
  patientName: z.string().min(2, "Name is required"),
  mobile: z.string().regex(egyptianPhoneRegex, "Valid Egyptian mobile number is required"),
  age: z.coerce.number().int().min(0).max(120),
  examType: z.enum(["examination", "followup", "consultation"]).default("examination"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  paymentMethod: z.enum(["cash", "instapay"]).default("cash"),
});

export const aiChatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  sessionId: z.string().optional(),
  phone: z.string().optional(),
});
