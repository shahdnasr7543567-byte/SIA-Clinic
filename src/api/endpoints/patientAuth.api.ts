
import { apiClient } from "@/api/axiosClient";
import type {
  PatientUser,
  PatientLoginPayload,
  PatientRegisterPayload,
} from "@/types/patientAuth";

export interface PatientAuthResponse {
  patient: PatientUser;
  token: string;
}

export const patientAuthApi = {
  login: (payload: PatientLoginPayload) =>
    apiClient.post<PatientAuthResponse>("/patient-auth/login", payload).then((r) => r.data),

  register: (payload: PatientRegisterPayload) =>
    apiClient.post<PatientAuthResponse>("/patient-auth/register", payload).then((r) => r.data),

  logout: () => apiClient.post<void>("/patient-auth/logout").then((r) => r.data),
}; 



