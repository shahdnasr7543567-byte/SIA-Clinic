
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePatientAuthStore } from "@/store/patientAuthStore";

/**
 * Route guard for patient-only pages. Deliberately separate from
 * ProtectedRoute (staff) — checks usePatientAuthStore only, never
 * useAuthStore. A staff session can never satisfy this guard, and a
 * patient session can never satisfy the staff ProtectedRoute.
 */
export function PatientProtectedRoute() {
  const { isAuthenticated, patient } = usePatientAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !patient) {
    return <Navigate to="/patient/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
} 



