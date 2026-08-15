import axios from "axios";
import { useAuthStore } from "@/store/authStore";

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

// Attach the Zustand-persisted token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 means the session is no longer valid on the server — log out and
// send the user back to /login rather than leaving the app in a broken state.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);
