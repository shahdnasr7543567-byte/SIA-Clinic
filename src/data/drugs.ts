import type { Drug, PrescriptionTemplate } from "@/types/prescription";

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

export const prescriptionTemplates: PrescriptionTemplate[] = [
  { id: "t1", label: "برد وأنفلونزا", diagnosis: "التهاب الجهاز التنفسي العلوي (نزلة برد)", drugIds: ["d1", "d5", "d17"] },
  { id: "t2", label: "ضغط الدم", diagnosis: "ارتفاع ضغط الدم", drugIds: ["d14", "d15"] },
  { id: "t3", label: "السكري", diagnosis: "متابعة مرض السكري النوع الثاني", drugIds: ["d13"] },
];
