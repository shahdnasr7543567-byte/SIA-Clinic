import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PatientUser } from "@/types/patientAuth";

interface PatientAuthState {
  patient: PatientUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (patient: PatientUser, token: string) => void;
  logout: () => void;
}

/**
 * Separate auth store for patients — deliberately NOT the same store as
 * useAuthStore (staff). Keeping them apart means a patient token can never
 * be read as a staff session or vice versa. Persisted under its own key so
 * a staff member and a patient can even be logged in on the same browser
 * without clashing.
 */
export const usePatientAuthStore = create<PatientAuthState>()(
  persist(
    (set) => ({
      patient: null,
      token: null,
      isAuthenticated: false,
      login: (patient, token) => set({ patient, token, isAuthenticated: true }),
      logout: () => set({ patient: null, token: null, isAuthenticated: false }),
    }),
    { name: "sia-patient-auth" }
  )
); 




