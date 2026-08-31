import { apiClient } from "@/api/axiosClient";
import type { ReceptionStats, QueueEntry, Patient, QueueStatus } from "@/types/patient";

export const receptionApi = {
  getStats: () => apiClient.get<ReceptionStats>("/reception/stats").then((r) => r.data),

  getQueue: () => apiClient.get<QueueEntry[]>("/reception/queue").then((r) => r.data),

  addPatient: (payload: Omit<Patient, "id" | "createdAt">) =>
    apiClient.post<Patient>("/reception/patients", payload).then((r) => r.data),

  updateQueueStatus: (entryId: string, status: QueueStatus) =>
    apiClient.patch<QueueEntry>(`/reception/queue/${entryId}`, { status }).then((r) => r.data),
};
