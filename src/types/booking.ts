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
export type BookingStatus = "pending" | "confirmed" | "done" | "completed" | "cancelled";

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

// شكل الرد من GET /patient/queue-status — بيوضح ترتيب المريض في طابور
// النهاردة (لو داخل فعلاً)، عشان يشوف كام واحد قبله من غير ما يسأل الاستقبال.
export interface QueueStatus {
  inQueue: boolean;
  queueNumber?: number;
  peopleAhead?: number;
  estimatedWaitMinutes?: number;
} 
