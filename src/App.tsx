import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PatientProtectedRoute } from "@/routes/PatientProtectedRoute";
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
const PrescriptionVerifyPage = lazy(() => import("@/pages/public/PrescriptionVerifyPage"));
const PatientPrescriptionsPage = lazy(() => import("@/pages/patient/PatientPrescriptionsPage"));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes — staff */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        {/* Public routes — patient (fully separate entry points from staff) */}
        <Route path="/register/:clinicCode" element={<PatientRegisterPage />} />
        <Route path="/patient/login" element={<PatientLoginPage />} />

        {/* Public route — anyone with the link can verify/view a single
            prescription (QR code / WhatsApp share target). No auth of any
            kind — reads only what getPublicPrescription intentionally
            exposes (no patient mobile, no internal ids). */}
        <Route path="/rx/verify/:code" element={<PrescriptionVerifyPage />} />

        {/*
          SECURITY: patient accounts were removed once before (2026) after a
          missing allowedRoles check let a patient session reach staff
          screens. Staff and patients are two fully separate auth systems:
          ProtectedRoute reads useAuthStore (staff) and MUST NEVER accept
          "patient" in allowedRoles. PatientProtectedRoute reads its own
          usePatientAuthStore and guards /patient/* only. Never share a
          route, a login form, a register form, or a guard between them.
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
        <Route element={<PatientProtectedRoute />}>
          <Route path="/patient/dashboard" element={<div>لوحة المريض (قريبًا)</div>} />
          <Route path="/patient/book" element={<BookingPage />} />
          <Route path="/patient/prescriptions" element={<PatientPrescriptionsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
} 
