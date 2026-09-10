
export interface Allergy {
  id: string;
  substance: string;      // اسم الدواء أو المادة
  reaction?: string;      // نوع رد الفعل (اختياري)
  severity: 'mild' | 'moderate' | 'severe';
}

export interface ChronicCondition {
  id: string;
  name: string;           // اسم المرض المزمن
  diagnosedDate?: string; // تاريخ التشخيص (اختياري)
  notes?: string;
}

export interface MedicalProfile {
  patientId: string;
  age: number;
  bloodType?: string;
  allergies: Allergy[];
  chronicConditions: ChronicCondition[];
}

