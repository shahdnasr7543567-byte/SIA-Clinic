
// Patient auth types — deliberately kept separate from src/types/auth.ts.
// Staff (admin/doctor/receptionist) and patients are two different account
// systems with two different tokens/stores. Never merge them — mixing them
// once before caused a patient session to reach staff-only screens.

export interface PatientUser {
  id: string;
  clinicId: string;
  name: string;
  mobile: string;
  age: number;
  createdAt: string;
}

export interface PatientLoginPayload {
  mobile: string;
  password: string;
}

export interface PatientRegisterPayload {
  name: string;
  mobile: string;
  age: number;
  password: string;
  clinicCode: string;
} 


