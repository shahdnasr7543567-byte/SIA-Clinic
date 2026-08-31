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