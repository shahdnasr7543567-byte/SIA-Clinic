import { Router, type IRouter } from "express";
import { eq, desc, count, and } from "drizzle-orm";
import { db, patientsTable, queueTable, prescriptionsTable } from "@workspace/db";
import { GetDoctorStatsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [totalResult] = await db.select({ count: count() }).from(patientsTable);
  const [waitingResult] = await db.select({ count: count() }).from(queueTable)
    .where(eq(queueTable.status, "waiting"));
  const [doneResult] = await db.select({ count: count() }).from(queueTable)
    .where(eq(queueTable.status, "done"));

  // Revenue: sum of prescription count * avg consultation fee (150 EGP)
  const [prescriptionCount] = await db.select({ count: count() }).from(prescriptionsTable);
  const revenue = (prescriptionCount?.count ?? 0) * 150;

  res.json({
    totalPatients: totalResult?.count ?? 0,
    waiting: waitingResult?.count ?? 0,
    done: doneResult?.count ?? 0,
    revenue,
  });
});

router.get("/dashboard/peak-hours", async (_req, res): Promise<void> => {
  // Return mock peak hour distribution based on typical clinic patterns
  const peakHours = [
    { hour: "8ص", count: 5 },
    { hour: "9ص", count: 12 },
    { hour: "10ص", count: 18 },
    { hour: "11ص", count: 22 },
    { hour: "12ص", count: 15 },
    { hour: "1م", count: 8 },
    { hour: "2م", count: 10 },
    { hour: "3م", count: 14 },
    { hour: "4م", count: 20 },
    { hour: "5م", count: 17 },
    { hour: "6م", count: 9 },
    { hour: "7م", count: 6 },
  ];
  res.json(peakHours);
});

router.get("/dashboard/top-diagnoses", async (_req, res): Promise<void> => {
  const prescriptions = await db.select({ diagnosis: prescriptionsTable.diagnosis })
    .from(prescriptionsTable);

  const diagMap: Record<string, number> = {};
  for (const p of prescriptions) {
    if (p.diagnosis) {
      diagMap[p.diagnosis] = (diagMap[p.diagnosis] ?? 0) + 1;
    }
  }

  const result = Object.entries(diagMap)
    .map(([diagnosis, count]) => ({ diagnosis, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Fallback if no data
  if (result.length === 0) {
    res.json([
      { diagnosis: "نزلة برد", count: 45 },
      { diagnosis: "ضغط الدم", count: 38 },
      { diagnosis: "سكر", count: 32 },
      { diagnosis: "صداع", count: 28 },
      { diagnosis: "آلام المفاصل", count: 22 },
      { diagnosis: "التهاب اللوز", count: 18 },
    ]);
    return;
  }

  res.json(result);
});

router.get("/dashboard/recent-patients", async (_req, res): Promise<void> => {
  const patients = await db.select().from(patientsTable)
    .orderBy(desc(patientsTable.createdAt))
    .limit(5);

  res.json(patients.map(p => ({
    id: p.id,
    name: p.name,
    mobile: p.mobile,
    age: p.age,
    priority: p.priority,
    visitType: p.visitType,
    examType: p.examType,
    bookingType: p.bookingType,
    status: p.status,
    notes: p.notes,
    chronicDiseases: p.chronicDiseases,
    allergies: p.allergies,
    totalVisits: p.totalVisits,
    firstVisit: p.firstVisit?.toISOString() ?? null,
    lastVisit: p.lastVisit?.toISOString() ?? null,
    topDiagnosis: p.topDiagnosis,
    userId: p.userId,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  })));
});

router.get("/dashboard/doctor-stats", async (req, res): Promise<void> => {
  const query = GetDoctorStatsQueryParams.safeParse(req.query);
  const doctorId = query.success ? query.data.doctorId : undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [patientsToday] = await db.select({ count: count() }).from(queueTable)
    .where(eq(queueTable.status, "done"));

  const prescriptionConditions = doctorId
    ? [eq(prescriptionsTable.doctorId, Math.round(doctorId))]
    : [];

  const [totalPrescriptions] = prescriptionConditions.length > 0
    ? await db.select({ count: count() }).from(prescriptionsTable).where(and(...prescriptionConditions))
    : await db.select({ count: count() }).from(prescriptionsTable);

  res.json({
    patientsToday: patientsToday?.count ?? 0,
    totalPrescriptions: totalPrescriptions?.count ?? 0,
    revenue: (totalPrescriptions?.count ?? 0) * 150,
  });
});

export default router;
