import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { Clinic } from "../models/Clinic.js";
import { User } from "../models/User.js";
import { Patient } from "../models/Patient.js";
import { Queue } from "../models/Queue.js";
import { Drug } from "../models/Drug.js";
import { Prescription } from "../models/Prescription.js";

const seedDatabase = async () => {
  try {
    console.log("[Seed] Connecting to MongoDB...");
    await connectDB();

    console.log("[Seed] Clearing existing collections...");
    await Promise.all([
      Clinic.deleteMany({}),
      User.deleteMany({}),
      Patient.deleteMany({}),
      Queue.deleteMany({}),
      Drug.deleteMany({}),
      Prescription.deleteMany({}),
    ]);

    console.log("[Seed] Creating Clinic...");
    const clinic = await Clinic.create({
      name: "عيادة النور التخصصية",
      code: "el-nour",
      phone: "01012345678",
      address: "أسيوط - شارع الجمهورية - برج النور الطبي - الدور الثالث",
      subscriptionPlan: "premium",
      subscriptionStatus: "active",
      settings: {
        dailyCapacity: 40,
        workingHours: { open: "09:00", close: "21:00" },
        consultationFee: 250,
        followUpFee: 120,
      },
    });

    console.log("[Seed] Creating Users...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    const [adminUser, doctorUser, receptionistUser] = await Promise.all([
      User.create({
        clinicId: clinic._id,
        name: "د. محمود الأحمدي (مدير النظام)",
        email: "admin@sia.clinic",
        passwordHash,
        role: "admin",
        phone: "01011111111",
        isActive: true,
      }),
      User.create({
        clinicId: clinic._id,
        name: "د. طارق المنشاوي",
        email: "doctor@sia.clinic",
        passwordHash,
        role: "doctor",
        phone: "01022222222",
        specialty: "استشاري الباطنة والقلب والأوعية الدموية",
        isActive: true,
      }),
      User.create({
        clinicId: clinic._id,
        name: "سارة إبراهيم",
        email: "reception@sia.clinic",
        passwordHash,
        role: "receptionist",
        phone: "01033333333",
        isActive: true,
      }),
    ]);

    console.log("[Seed] Creating Common Egyptian Drugs...");
    const drugsData = [
      {
        name: "Panadol Extra 500mg",
        genericName: "Paracetamol 500mg + Caffeine 65mg",
        form: "tablet" as const,
        defaultDosage: "قرص واحد",
        commonUnits: ["days", "weeks"],
      },
      {
        name: "Augmentin 1g",
        genericName: "Amoxicillin 875mg + Clavulanic Acid 125mg",
        form: "tablet" as const,
        defaultDosage: "قرص كل 12 ساعة",
        commonUnits: ["days"],
      },
      {
        name: "Concor 5mg",
        genericName: "Bisoprolol Fumarate 5mg",
        form: "tablet" as const,
        defaultDosage: "قرص صباحاً على الريق",
        commonUnits: ["months", "weeks"],
      },
      {
        name: "Glucophage 1000mg",
        genericName: "Metformin Hydrochloride",
        form: "tablet" as const,
        defaultDosage: "قرص مع الوجبة الرئيسية",
        commonUnits: ["months"],
      },
      {
        name: "Cataflam 50mg",
        genericName: "Diclofenac Potassium",
        form: "tablet" as const,
        defaultDosage: "قرص عند اللزوم بعد الأكل",
        commonUnits: ["days"],
      },
      {
        name: "Nexium 40mg",
        genericName: "Esomeprazole Magnesium",
        form: "capsule" as const,
        defaultDosage: "كبسولة قبل الإفطار بنصف ساعة",
        commonUnits: ["weeks", "months"],
      },
      {
        name: "Cipralex 10mg",
        genericName: "Escitalopram",
        form: "tablet" as const,
        defaultDosage: "قرص مساءً",
        commonUnits: ["months"],
      },
      {
        name: "Otrivin 0.1% Adult Nasal Spray",
        genericName: "Xylometazoline HCl",
        form: "drops" as const,
        defaultDosage: "بختين في كل فتحة أنف",
        commonUnits: ["days"],
      },
    ];

    await Drug.insertMany(drugsData.map((d) => ({ ...d, clinicId: clinic._id })));

    console.log("[Seed] Creating Sample Patients...");
    const [patient1, patient2, patient3] = await Promise.all([
      Patient.create({
        clinicId: clinic._id,
        name: "أحمد علي عبد الرحمن",
        mobile: "01098765432",
        age: 45,
        gender: "male",
        allergies: ["بنسلين (Penicillin)"],
        chronicDiseases: ["ضغط دم مرتفع (Hypertension)", "داء السكري من النوع الثاني"],
        notes: "مريض منتظم المتابعة، يعاني من حساسية الصدر",
      }),
      Patient.create({
        clinicId: clinic._id,
        name: "مريم حسن السيد",
        mobile: "01123456789",
        age: 29,
        gender: "female",
        allergies: [],
        chronicDiseases: [],
        notes: "شكوى من إرهاق مستمر وصداع نصفي",
      }),
      Patient.create({
        clinicId: clinic._id,
        name: "عمر خالد المحمدي",
        mobile: "01234567890",
        age: 52,
        gender: "male",
        allergies: ["Sulfa drugs"],
        chronicDiseases: ["السكري"],
        notes: "حالة طارئة - آلام حادة بالصدر",
      }),
    ]);

    const todayStr = new Date().toISOString().split("T")[0];

    console.log("[Seed] Creating Queue Entries for Today...");
    await Promise.all([
      Queue.create({
        clinicId: clinic._id,
        patientId: patient3._id,
        queueNumber: 1,
        status: "waiting",
        priority: "critical",
        examType: "examination",
        visitDate: todayStr,
        notes: "حالة طارئة تحتاج كشف فوري",
      }),
      Queue.create({
        clinicId: clinic._id,
        patientId: patient1._id,
        queueNumber: 2,
        status: "waiting",
        priority: "urgent",
        examType: "followup",
        visitDate: todayStr,
        notes: "متابعة قياس الضغط والسكر",
      }),
      Queue.create({
        clinicId: clinic._id,
        patientId: patient2._id,
        queueNumber: 3,
        status: "waiting",
        priority: "normal",
        examType: "examination",
        visitDate: todayStr,
      }),
    ]);

    console.log("[Seed] Creating Sample Prescription...");
    await Prescription.create({
      clinicId: clinic._id,
      patientId: patient1._id,
      doctorId: doctorUser._id,
      prescriptionNumber: `RX-${todayStr.replace(/-/g, "")}-001`,
      diagnosis: "ارتفاع في ضغط الدم مع التهاب حاد في الجيوب الأنفية",
      drugs: [
        {
          name: "Concor 5mg",
          dosage: "قرص واحد",
          frequency: "مرة واحدة يومياً صباحاً",
          duration: "1",
          unit: "months",
          instructions: "يؤخذ قبل الإفطار",
        },
        {
          name: "Augmentin 1g",
          dosage: "قرص واحد",
          frequency: "كل 12 ساعة",
          duration: "7",
          unit: "days",
          instructions: "بعد الأكل",
        },
      ],
      qrHash: "sample-qr-token-12345678",
      sentToPharmacy: false,
      notes: "إعادة الكشف بعد أسبوعين لمراجعة الضغط",
    });

    console.log("[Seed] ==================================");
    console.log("[Seed] Seed completed successfully!");
    console.log("[Seed] Test Credentials:");
    console.log("[Seed] Admin:        admin@sia.clinic / password123");
    console.log("[Seed] Doctor:       doctor@sia.clinic / password123");
    console.log("[Seed] Receptionist: reception@sia.clinic / password123");
    console.log("[Seed] ==================================");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("[Seed] Error during seeding:", error);
    process.exit(1);
  }
};

seedDatabase();
