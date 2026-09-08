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

// Attach whichever session is active. Staff and patients are two separate
// stores/tokens — a browser tab is expected to be logged in as one or the
// other, never both at once, so prefer staff if present, else patient.
apiClient.interceptors.request.use((config) => {
  const staffToken = useAuthStore.getState().token;
  const patientToken = usePatientAuthStore.getState().token;
  const token = staffToken ?? patientToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 means the session is no longer valid on the server — log out of
// whichever session actually made the request and send the user to the
// matching login page. Staff and patient sessions are never mixed here.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isPatientSession = usePatientAuthStore.getState().isAuthenticated;

      if (isPatientSession) {
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
