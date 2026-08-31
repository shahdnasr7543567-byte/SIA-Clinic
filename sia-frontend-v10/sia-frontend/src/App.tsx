import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PageLoader } from "@/components/shared/PageLoader";

// Every route is code-split with React.lazy: each page ships as its own
// chunk and is only downloaded when the user actually navigates to it,
// instead of all 10+ pages bloating the initial bundle.
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const AccessDeniedPage = lazy(() => import("@/pages/AccessDeniedPage"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const BookingPage = lazy(() => import("@/pages/booking/BookingPage"));
const ReceptionDashboard = lazy(() => import("@/pages/reception/ReceptionDashboard"));
const AddPatientPage = lazy(() => import("@/pages/reception/AddPatientPage"));
const QueuePage = lazy(() => import("@/pages/reception/QueuePage"));
const DoctorDashboardPage = lazy(() => import("@/pages/doctor/DoctorDashboardPage"));
const DoctorQueuePage = lazy(() => import("@/pages/doctor/DoctorQueuePage"));
const PrescriptionBuilderPage = lazy(() => import("@/pages/doctor/PrescriptionBuilderPage"));
const PatientSearchPage = lazy(() => import("@/pages/patient/PatientSearchPage"));
const PatientProfilePage = lazy(() => import("@/pages/patient/PatientProfilePage"));
const ChatPage = lazy(() => import("@/pages/ai-agent/ChatPage"));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        {/*
          SECURITY: there is intentionally no /register route. Patients never
          get a login account — their only touchpoints are /book (public, no
          auth) and the AI Agent / WhatsApp. The old RegisterPage created a
          real session with role "patient", and because staff routes below
          didn't all pin allowedRoles explicitly, that session could reach
          Reception/Doctor/Prescription screens. Every staff route now
          whitelists roles explicitly as defense in depth — keep doing that
          for any new route, even ones that "feel" safe without it.
        */}

        {/* Protected app shell — staff only (any of the 3 real roles) */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "doctor", "receptionist"]} />}>
          <Route element={<AppLayout />}>
            {/* Admin: dedicated overview, admin-only */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>

            {/* Reception: admin + receptionist */}
            <Route element={<ProtectedRoute allowedRoles={["admin", "receptionist"]} />}>
              <Route path="/reception" element={<ReceptionDashboard />} />
              <Route path="/reception/add-patient" element={<AddPatientPage />} />
              <Route path="/reception/queue" element={<QueuePage />} />
            </Route>

            {/* Doctor: admin + doctor — clinical screens + patient charts */}
            <Route element={<ProtectedRoute allowedRoles={["doctor", "admin"]} />}>
              <Route path="/doctor" element={<DoctorDashboardPage />} />
              <Route path="/doctor/queue" element={<DoctorQueuePage />} />
              <Route path="/doctor/prescription/new" element={<PrescriptionBuilderPage />} />
              <Route path="/patients/search" element={<PatientSearchPage />} />
              <Route path="/patients/:id" element={<PatientProfilePage />} />
              {/* AI Assistant is a clinical tool — doctors + admin only, not reception */}
              <Route path="/ai-agent" element={<ChatPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
