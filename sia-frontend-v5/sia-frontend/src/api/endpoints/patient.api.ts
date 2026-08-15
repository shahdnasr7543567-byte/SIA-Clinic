import { apiClient } from "@/api/axiosClient";
import type { Patient } from "@/types/patient";
import type {
  PatientMedicalInfo,
  PatientStats,
  PrescriptionHistoryEntry,
  Reminder,
  ReminderPreset,
} from "@/types/patientProfile";

export const patientApi = {
  search: (query: string) =>
    apiClient.get<Patient[]>("/patients/search", { params: { q: query } }).then((r) => r.data),

  getById: (id: string) => apiClient.get<Patient>(`/patients/${id}`).then((r) => r.data),

  getMedicalInfo: (id: string) =>
    apiClient.get<PatientMedicalInfo>(`/patients/${id}/medical`).then((r) => r.data),

  getStats: (id: string) => apiClient.get<PatientStats>(`/patients/${id}/stats`).then((r) => r.data),

  getPrescriptionHistory: (id: string) =>
    apiClient.get<PrescriptionHistoryEntry[]>(`/patients/${id}/history`).then((r) => r.data),

  getReminders: (id: string) =>
    apiClient.get<Reminder[]>(`/patients/${id}/reminders`).then((r) => r.data),

  createReminder: (id: string, preset: ReminderPreset, date: string) =>
    apiClient.post<Reminder>(`/patients/${id}/reminders`, { preset, date }).then((r) => r.data),
};
