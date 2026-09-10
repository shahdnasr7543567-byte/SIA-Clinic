export type DrugForm = "tablet" | "syrup" | "ointment" | "injection" | "spray" | "capsule";

export interface Drug {
  id: string;
  name: string;
  genericName: string;
  form: DrugForm;
}

export interface PrescriptionDrugLine {
  lineId: string;
  drug: Drug;
  dosage: string;
  frequency: string;
  duration: string;
  durationUnit: "days" | "weeks" | "months";
  instructions?: string;
}

export interface Prescription {
  id: string;
  patientName: string;
  patientAge?: number;
  diagnosis: string;
  drugs: PrescriptionDrugLine[];
  notes?: string;
  createdAt: string;
}

// الشكل الفعلي اللي بيرجعه الباك إند من POST /doctor/prescriptions
// و GET /doctor/prescriptions/:id — أدوية "مسطحة" من غير lineId ولا nested drug object.
export interface PrescriptionRecordDrug {
  name: string;
  genericName?: string;
  form: string;
  dosage: string;
  frequency: string;
  duration: string;
  unit: "days" | "weeks" | "months";
  instructions?: string;
}

// الرد الكامل من POST /doctor/prescriptions (وكمان GET /doctor/prescriptions/:id)
export interface PrescriptionRecord {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  drugs: PrescriptionRecordDrug[];
  notes?: string;
  qrHash: string;
  createdAt: string;
}

// الرد من GET /api/public/prescriptions/:code (صفحة التحقق العامة، من غير تسجيل دخول)
export interface PublicPrescriptionView {
  success: boolean;
  prescriptionNumber: string;
  date: string;
  clinic: { name: string; phone?: string; address?: string } | null;
  doctor: { name: string; specialty?: string } | null;
  patient: { name: string; age?: number; gender?: string } | null;
  diagnosis: string;
  drugs: PrescriptionRecordDrug[];
  notes?: string;
  verified: boolean;
} 
