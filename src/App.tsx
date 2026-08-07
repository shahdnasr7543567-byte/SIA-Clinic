import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PageLoader } from "@/components/shared/PageLoader";

// Every route is code-split with React.lazy: each page ships as its own
// chunk and is only downloaded when the user actually navigates to it,
// instead of all 10+ pages bloating the initial bundle.
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const BookingPage = lazy(() => import("@/pages/booking/BookingPage"));
const ReceptionDashboard = lazy(() => import("@/pages/reception/ReceptionDashboard"));
const AddPatientPage = lazy(() => import("@/pages/reception/AddPatientPage"));
const QueuePage = lazy(() => import("@/pages/reception/QueuePage"));
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/book" element={<BookingPage />} />

        {/* Protected app shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<ReceptionDashboard />} />
            <Route path="/reception/add-patient" element={<AddPatientPage />} />
            <Route path="/reception/queue" element={<QueuePage />} />
            <Route path="/doctor/queue" element={<DoctorQueuePage />} />
            <Route path="/doctor/prescription/new" element={<PrescriptionBuilderPage />} />

            {/* Only doctors/admins can look up a patient's chart, per the brief */}
            <Route element={<ProtectedRoute allowedRoles={["doctor", "admin"]} />}>
              <Route path="/patients/search" element={<PatientSearchPage />} />
              <Route path="/patients/:id" element={<PatientProfilePage />} />
            </Route>

            <Route path="/ai-agent" element={<ChatPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
