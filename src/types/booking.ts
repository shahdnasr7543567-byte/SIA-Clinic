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

// حالة الحجز زي ما بترجع من الباك إند بعد ما يتحفظ ويتراجع من الريسبشن.
export type BookingStatus = "pending" | "confirmed" | "done" | "cancelled";

// شكل الحجز الكامل زي ما بيرجع من GET /patient/bookings — نفس بيانات
// الفورم (OnlineBookingPayload) بالإضافة لبيانات السيرفر (id, status, تاريخ الإنشاء).
export interface BookingRecord {
  id: string;
  examType: ExamType;
  date: string;
  time: string;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  createdAt: string;
} 
