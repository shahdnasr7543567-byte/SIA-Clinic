import { apiClient } from "@/api/axiosClient";
import type { PrescriptionDrugLine, PrescriptionRecord } from "@/types/prescription";
import type { Gender, Priority, ExamType } from "@/types/patient";

export interface DoctorStats {
  patients: number;
  prescriptions: number;
  revenue: number;
}

export interface DoctorQueueEntry {
  id: string;
  patientId: string;
  name: string;
  mobile: string;
  age: number;
  gender: Gender;
  priority: Priority;
  examType: ExamType;
  queueNumber: number;
  enteredAt: string;
}

export interface CreatePrescriptionPayload {
  patientId: string;
  queueId: string;
  diagnosis: string;
  drugs: {
    name: string;
    genericName: string;
    form: string;
    dosage: string;
    frequency: string;
    duration: string;
    unit: PrescriptionDrugLine["durationUnit"];
    instructions?: string;
  }[];
  notes?: string;
}

export const doctorApi = {
  getStats: () => apiClient.get<DoctorStats>("/doctor/stats").then((r) => r.data),

  getQueue: () => apiClient.get<DoctorQueueEntry[]>("/doctor/queue").then((r) => r.data),

  // بترجع الشكل الحقيقي من الباك إند (فيه qrHash وprescriptionNumber)
  // مش النوع القديم Prescription اللي كان شكله مختلف عن الرد الفعلي.
  createPrescription: (payload: CreatePrescriptionPayload) =>
    apiClient.post<PrescriptionRecord>("/doctor/prescriptions", payload).then((r) => r.data),

  getPrescription: (id: string) =>
    apiClient.get<PrescriptionRecord>(`/doctor/prescriptions/${id}`).then((r) => r.data),

  sendToPharmacy: (prescriptionId: string) =>
    apiClient.post<void>(`/doctor/prescriptions/${prescriptionId}/send-to-pharmacy`).then((r) => r.data),
}; 
