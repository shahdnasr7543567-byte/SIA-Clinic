import { apiClient } from "@/api/axiosClient";
import type { PrescriptionRecord } from "@/types/prescription";
import type { BookingRecord } from "@/types/booking";
import type { MyMedicalProfile } from "@/types/patientProfile";

/**
 * Self-service endpoints for a logged-in PATIENT viewing their own data.
 * Distinct from patient.api.ts (staff looking up a patient by id) and
 * from doctor.api.ts (doctor creating prescriptions) — this file is only
 * ever called with a patient token, never a staff token.
 */
export const patientPortalApi = {
  getMyPrescriptions: () =>
    apiClient.get<PrescriptionRecord[]>("/patient/prescriptions").then((r) => r.data),

  getPrescriptionById: (id: string) =>
    apiClient.get<PrescriptionRecord>(`/patient/prescriptions/${id}`).then((r) => r.data),

  getMyBookings: () =>
    apiClient.get<BookingRecord[]>("/patient/bookings").then((r) => r.data),

  getMyMedicalProfile: () =>
    apiClient.get<MyMedicalProfile>("/patient/medical-profile").then((r) => r.data),
}; 
