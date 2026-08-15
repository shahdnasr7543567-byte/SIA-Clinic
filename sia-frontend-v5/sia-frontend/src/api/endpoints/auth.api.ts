import { apiClient } from "@/api/axiosClient";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/auth/login", payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>("/auth/register", payload).then((r) => r.data),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>("/auth/forgot-password", { email }).then((r) => r.data),

  logout: () => apiClient.post<void>("/auth/logout").then((r) => r.data),
};
