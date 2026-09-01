import type { ExamType } from "@/types/patient";

export type PaymentMethod = "cash" | "instapay";

export interface OnlineBookingPayload {
  patientName: string;
  mobile: string;
  age: number;
  examType: ExamType;
  date: string;
  time: string;
  paymentMethod: PaymentMethod;
}
