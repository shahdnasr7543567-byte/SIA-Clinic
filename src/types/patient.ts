export type BookingType = "walkIn" | "online" | "phone";
export type VisitType = "new" | "followUp";
export type ExamType = "clinic" | "home" | "online";
export type Priority = "normal" | "urgent" | "emergency";
export type QueueStatus = "waiting" | "done" | "cancelled";

export interface Patient {
  id: string;
  name: string;
  mobile: string;
  age: number;
  priority: Priority;
  visitType: VisitType;
  examType: ExamType;
  bookingType: BookingType;
  notes?: string;
  createdAt: string;
}

export interface QueueEntry {
  id: string;
  patient: Patient;
  status: QueueStatus;
  queuedAt: string;
}

export interface ReceptionStats {
  totalPatients: number;
  waiting: number;
  done: number;
  revenue: number;
}
