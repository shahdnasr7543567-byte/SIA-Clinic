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
const PatientRegisterPage = lazy(() => import("@/pages/auth/PatientRegisterPage"));
const PatientLoginPage = lazy(() => import("@/pages/auth/PatientLoginPage"));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes — staff */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        {/* Public routes — patient (fully separate entry points from staff) */}
        <Route path="/register/:clinicCode" element={<PatientRegisterPage />} />
        <Route path="/patient/login" element={<PatientLoginPage />} />

        {/*
          SECURITY: patient accounts were removed once before (2026) after a
          missing allowedRoles check let a patient session reach staff
          screens. Every staff route below MUST keep an explicit
          allowedRoles guard — "patient" must NEVER appear in any staff
          route's allowedRoles list. Patient-only routes live under
          /patient/* with their own ProtectedRoute guard
          (allowedRoles={["patient"]}) and never share a route, a login
          form, or a register form with staff.
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

        {/* Patient-only routes — completely separate from staff, own guard */}
    <Route element={<ProtectedRoute allowedRoles={["patient"]} redirectTo="/patient/login" />}>
      <Route path="/patient/dashboard" element={<div>لوحة المريض (قريبًا)</div>} />
    </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
} 