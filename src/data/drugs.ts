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

export const drugFormIcons: Record<DrugForm, LucideIcon> = {
  tablet: Pill,
  capsule: PillBottle,
  syrup: FlaskConical,
  injection: Syringe,
  spray: SprayCan,
  ointment: Bandage,
};

export const frequencyOptions = [
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

export const dosageAmountOptions = [
  { id: "half", label: "نصف قرص" },
  { id: "one", label: "قرص واحد" },
  { id: "two", label: "قرصين" },
  { id: "5ml", label: "5 مل" },
  { id: "10ml", label: "10 مل" },
  { id: "oneAmp", label: "أمبولة واحدة" },
  { id: "custom", label: "أخرى (تحديد يدوي)" },
] as const;

export const durationPresetsDays = [3, 5, 7, 10, 14, 30]; 