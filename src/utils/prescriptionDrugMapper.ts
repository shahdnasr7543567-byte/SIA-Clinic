
import type { PrescriptionDrugLine, PrescriptionRecordDrug, DrugForm } from "@/types/prescription";

const knownForms: DrugForm[] = ["tablet", "syrup", "ointment", "injection", "spray", "capsule"];

// بيحول شكل الأدوية "المسطح" الجاي من الباك إند (PrescriptionRecordDrug)
// لنفس شكل PrescriptionDrugLine اللي مكون PrescriptionPreview متوقعه.
// مستخدم في أكتر من صفحة (صفحة التحقق العامة، صفحة روشتاتي عند المريض)
// عشان منكررش نفس التحويل في كل ملف.
export function mapRecordDrugsToLines(drugs: PrescriptionRecordDrug[]): PrescriptionDrugLine[] {
  return drugs.map((d, i) => ({
    lineId: `record-${i}`,
    drug: {
      id: `record-${i}`,
      name: d.name,
      genericName: d.genericName ?? "",
      form: knownForms.includes(d.form as DrugForm) ? (d.form as DrugForm) : "tablet",
    },
    dosage: d.dosage,
    frequency: d.frequency,
    duration: d.duration,
    durationUnit: d.unit,
    instructions: d.instructions,
  }));
} 


