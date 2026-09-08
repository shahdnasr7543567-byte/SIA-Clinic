import { apiClient } from "@/api/axiosClient";
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  PatientRegisterPayload,
  PatientLoginPayload,
} from "@/types/auth";

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export const authApi = {
  // Staff login (admin/doctor/receptionist) — email based.
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/auth/login", payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>("/auth/register", payload).then((r) => r.data),

  // Patient self-registration — separate endpoint on purpose (see security
  // note in types/auth.ts).
  patientRegister: (payload: PatientRegisterPayload) =>
    apiClient.post<AuthResponse>("/auth/patient-register", payload).then((r) => r.data),

  // Patient login — phone based, separate from staff login.
  patientLogin: (payload: PatientLoginPayload) =>
    apiClient.post<AuthResponse>("/auth/patient-login", payload).then((r) => r.data),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>("/auth/forgot-password", { email }).then((r) => r.data),

  logout: () => apiClient.post<void>("/auth/logout").then((r) => r.data),
}; 
