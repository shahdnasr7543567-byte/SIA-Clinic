import { apiClient } from "@/api/axiosClient";
import type { ReceptionStats, QueueEntry, CreatePatientPayload, QueueStatus } from "@/types/patient";

export const receptionApi = {
  getStats: () => apiClient.get<ReceptionStats>("/reception/stats").then((r) => r.data),

  getQueue: () => apiClient.get<QueueEntry[]>("/reception/queue").then((r) => r.data),

  // POST /reception/patients takes the flat CreatePatientPayload body and
  // returns the new queue entry (patient nested inside), not a bare Patient.
  addPatient: (payload: CreatePatientPayload) =>
    apiClient.post<QueueEntry>("/reception/patients", payload).then((r) => r.data),

  updateQueueStatus: (entryId: string, status: QueueStatus) =>
    apiClient.patch<QueueEntry>(`/reception/queue/${entryId}`, { status }).then((r) => r.data),
};
