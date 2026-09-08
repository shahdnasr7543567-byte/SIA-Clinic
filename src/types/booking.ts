import type { ExamType } from "@/types/patient";

export type PaymentMethod = "cash" | "instapay";

// patientName/mobile removed on purpose: the booking is now made by a
// logged-in patient, so the backend identifies the patient from the auth
// token — the form no longer asks for identity, only the visit details.
export interface OnlineBookingPayload {
  examType: ExamType;
  date: string;
  time: string;
  paymentMethod: PaymentMethod;
} 
