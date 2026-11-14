import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { usePatientAuthStore } from "@/store/patientAuthStore";

/**
 * Single shared axios instance. Every file under api/endpoints/ imports
 * this instead of calling axios directly, so base URL / auth / error
 * handling only has to be configured once.
 *
 * VITE_API_BASE_URL is read from .env (see .env.example) — falls back to
 * a relative /api path so the app still boots in dev before that's set.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// Staff and patients are two separate sessions/tokens. Pick the token by
// the area of the app the user is in (not by "whichever exists"), so a
// leftover staff token can never be sent from a patient page and vice versa.
function isPatientArea(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return path.startsWith("/patient") || path.startsWith("/register");
}

apiClient.interceptors.request.use((config) => {
  const token = isPatientArea()
    ? usePatientAuthStore.getState().token
    : useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 means the session is no longer valid on the server — log out of
// the session that belongs to the current area and send the user to the
// matching login page.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (isPatientArea()) {
        usePatientAuthStore.getState().logout();
        if (typeof window !== "undefined" && window.location.pathname !== "/patient/login") {
          window.location.assign("/patient/login");
        }
      } else {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }
    }
    return Promise.reject(error);
  }
);
