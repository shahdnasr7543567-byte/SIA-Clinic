// Roles: staff (admin/doctor/receptionist) + patient.
// Patient accounts were removed once before (2026) after a security
// incident where a missing allowedRoles check let a patient session
// reach staff screens. Patient routes MUST stay fully separate from
// staff routes, and every staff route MUST keep an explicit
// allowedRoles guard — do not rely on absence of a patient route alone.
export type UserRole = "receptionist" | "doctor" | "admin" | "patient";

export interface AuthUser {
  _id: string;
  clinicId: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  specialty?: string;
  clinicCode: string;
}

// New: patient self-registration payload (separate from staff RegisterPayload
// on purpose — patients never pick a role, and never see staff fields).
export interface PatientRegisterPayload {
  name: string;
  phone: string;
  password: string;
  age?: number;
  clinicCode: string;
}

// Patient login — phone based (separate from staff LoginPayload which
// stays email based).
export interface PatientLoginPayload {
  phone: string;
  password: string;
} 
