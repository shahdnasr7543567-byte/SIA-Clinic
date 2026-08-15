export interface ChronicCondition {
  id: string;
  name: string;
}

export interface PatientMedicalInfo {
  chronicDiseases: string[];
  allergies: string[];
}

export interface PatientStats {
  totalVisits: number;
  firstVisit: string | null;
  lastVisit: string | null;
  topDiagnosis: string | null;
}

export interface PrescriptionHistoryEntry {
  id: string;
  date: string;
  diagnosis: string;
  drugCount: number;
}

export type ReminderPreset = "tomorrow" | "week" | "month" | "custom";

export interface Reminder {
  id: string;
  patientId: string;
  date: string;
  note?: string;
}
