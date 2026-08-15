import { apiClient } from "@/api/axiosClient";
import type { Prescription } from "@/types/prescription";

export interface DoctorStats {
  patients: number;
  prescriptions: number;
  revenue: number;
}

export interface DoctorQueueEntry {
  id: string;
  name: string;
  mobile: string;
}

export const doctorApi = {
  getStats: () => apiClient.get<DoctorStats>("/doctor/stats").then((r) => r.data),

  getQueue: () => apiClient.get<DoctorQueueEntry[]>("/doctor/queue").then((r) => r.data),

  createPrescription: (payload: Omit<Prescription, "id" | "createdAt">) =>
    apiClient.post<Prescription>("/doctor/prescriptions", payload).then((r) => r.data),

  getPrescription: (id: string) =>
    apiClient.get<Prescription>(`/doctor/prescriptions/${id}`).then((r) => r.data),

  sendToPharmacy: (prescriptionId: string) =>
    apiClient.post<void>(`/doctor/prescriptions/${prescriptionId}/send-to-pharmacy`).then((r) => r.data),
};
