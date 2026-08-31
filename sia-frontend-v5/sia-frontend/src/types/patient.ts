// NOTE: these types were updated to match the real backend response
// (GET /api/reception/queue) instead of the earlier placeholder shape.
// See AGENTS.md / chat history for the field-by-field diff that drove this.

export type Gender = "male" | "female";
export type ExamType = "examination" | "followup" | "consultation";
export type Priority = "normal" | "urgent" | "critical";
export type QueueStatus = "waiting" | "done" | "cancelled";

// Patient is now just the person's own data — priority/examType/notes for a
// specific visit live on QueueEntry, not here (the backend nests patient
// *inside* the queue entry, it doesn't flatten everything into one object).
export interface Patient {
  id: string;
  name: string;
  mobile: string;
  age: number;
  gender: Gender;
  allergies: string[];
  chronicDiseases: string[];
  notes?: string;
  createdAt: string;
}

export interface QueueEntry {
  id: string;
  queueNumber: number;
  patient: Patient;
  priority: Priority;
  status: QueueStatus;
  examType: ExamType;
  enteredAt: string;
  notes?: string;
}

// Shape of the POST /api/reception/patients body — flat, and deliberately
// different from the Patient/QueueEntry response shape above (the backend
// generates id/queueNumber/status/enteredAt itself).
export interface CreatePatientPayload {
  name: string;
  mobile: string;
  age: number;
  gender: Gender;
  priority: Priority;
  examType: ExamType;
  notes?: string;
}

export interface ReceptionStats {
  totalPatients: number;
  waiting: number;
  done: number;
  revenue: number;
}
