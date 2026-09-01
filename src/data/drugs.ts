import { Pill, PillBottle, FlaskConical, Syringe, SprayCan, Bandage, type LucideIcon } from "lucide-react";
import type { Drug, DrugForm } from "@/types/prescription";

export const drugDatabase: Drug[] = [
  { id: "d1", name: "بانادول", genericName: "Paracetamol", form: "tablet" },
  { id: "d2", name: "بروفين", genericName: "Ibuprofen", form: "tablet" },
  { id: "d3", name: "أوجمنتين", genericName: "Amoxicillin/Clavulanate", form: "tablet" },
  { id: "d4", name: "زيثروماكس", genericName: "Azithromycin", form: "tablet" },
  { id: "d5", name: "كونجستال", genericName: "Paracetamol/Phenylephrine/Chlorpheniramine", form: "tablet" },
  { id: "d6", name: "فلاجيل", genericName: "Metronidazole", form: "tablet" },
  { id: "d7", name: "نيوروبيون", genericName: "Vitamin B Complex", form: "injection" },
  { id: "d8", name: "فنترا", genericName: "Domperidone", form: "syrup" },
  { id: "d9", name: "تيلفاست", genericName: "Fexofenadine", form: "tablet" },
  { id: "d10", name: "فوسيدين", genericName: "Fusidic Acid", form: "ointment" },
  { id: "d11", name: "فنتولين", genericName: "Salbutamol", form: "spray" },
  { id: "d12", name: "أموكسيل", genericName: "Amoxicillin", form: "capsule" },
  { id: "d13", name: "جلوكوفاج", genericName: "Metformin", form: "tablet" },
  { id: "d14", name: "كونكور", genericName: "Bisoprolol", form: "tablet" },
  { id: "d15", name: "نورفاسك", genericName: "Amlodipine", form: "tablet" },
  { id: "d16", name: "لانتوس", genericName: "Insulin Glargine", form: "injection" },
  { id: "d17", name: "زيرتك", genericName: "Cetirizine", form: "syrup" },
  { id: "d18", name: "بروسبان", genericName: "Ivy Leaf Extract", form: "syrup" },
];

export const drugFormLabels: Record<Drug["form"], string> = {
  tablet: "أقراص",
  syrup: "شراب",
  ointment: "مرهم",
  injection: "حقن",
  spray: "بخاخ",
  capsule: "كبسولات",
};

// Visual icon per drug form — helps the doctor tell the dosage form apart at
// a glance (tablet vs syrup vs injection...) without reading the label text.
export const drugFormIcons: Record<DrugForm, LucideIcon> = {
  tablet: Pill,
  capsule: PillBottle,
  syrup: FlaskConical,
  injection: Syringe,
  spray: SprayCan,
  ointment: Bandage,
};

// Common dosing frequencies a doctor can pick from instead of typing the
// dosage schedule freehand every time. "أخرى" (custom) falls back to a free
// text field so unusual regimens are still possible.
export const dosageFrequencyOptions = [
  { id: "once", label: "مرة واحدة يوميًا" },
  { id: "twice", label: "مرتين يوميًا" },
  { id: "thrice", label: "3 مرات يوميًا" },
  { id: "four", label: "4 مرات يوميًا" },
  { id: "every6h", label: "كل 6 ساعات" },
  { id: "every8h", label: "كل 8 ساعات" },
  { id: "every12h", label: "كل 12 ساعة" },
  { id: "prn", label: "عند اللزوم" },
  { id: "custom", label: "أخرى (تحديد يدوي)" },
] as const;

// Common treatment-duration presets (in days) the doctor can tap instead of
// typing a number every time. Manual entry is still available alongside these.
export const durationPresetsDays = [3, 5, 7, 10, 14, 30];
