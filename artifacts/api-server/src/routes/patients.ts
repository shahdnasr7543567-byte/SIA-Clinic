import { Router, type IRouter } from "express";
import { eq, like, or, desc } from "drizzle-orm";
import { db, patientsTable } from "@workspace/db";
import {
  CreatePatientBody,
  UpdatePatientBody,
  GetPatientParams,
  UpdatePatientParams,
  ListPatientsQueryParams,
  GetPatientAnalyticsParams,
  GetPatientPrescriptionsParams,
} from "@workspace/api-zod";
import { prescriptionsTable } from "@workspace/db";

const router: IRouter = Router();

function formatPatient(p: typeof patientsTable.$inferSelect) {
  return {
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
  };
}

router.get("/patients", async (req, res): Promise<void> => {
  const query = ListPatientsQueryParams.safeParse(req.query);
  const search = query.success ? query.data.search : undefined;
  const limit = query.success ? (query.data.limit ?? 50) : 50;
  const offset = query.success ? (query.data.offset ?? 0) : 0;

  let patients;
  if (search) {
    patients = await db.select().from(patientsTable)
      .where(or(
        like(patientsTable.name, `%${search}%`),
        like(patientsTable.mobile, `%${search}%`),
      ))
      .orderBy(desc(patientsTable.createdAt))
      .limit(limit)
      .offset(offset);
  } else {
    patients = await db.select().from(patientsTable)
      .orderBy(desc(patientsTable.createdAt))
      .limit(limit)
      .offset(offset);
  }

  res.json(patients.map(formatPatient));
});

router.post("/patients", async (req, res): Promise<void> => {
  const parsed = CreatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [patient] = await db.insert(patientsTable).values({
    ...parsed.data,
    age: Math.round(parsed.data.age),
    firstVisit: new Date(),
    lastVisit: new Date(),
    totalVisits: 1,
  }).returning();

  res.status(201).json(formatPatient(patient));
});

router.get("/patients/:id", async (req, res): Promise<void> => {
  const params = GetPatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  res.json(formatPatient(patient));
});

router.patch("/patients/:id", async (req, res): Promise<void> => {
  const params = UpdatePatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.age !== undefined) {
    updateData.age = Math.round(parsed.data.age);
  }

  const [patient] = await db.update(patientsTable)
    .set(updateData as Partial<typeof patientsTable.$inferInsert>)
    .where(eq(patientsTable.id, params.data.id))
    .returning();

  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  res.json(formatPatient(patient));
});

router.get("/patients/:id/analytics", async (req, res): Promise<void> => {
  const params = GetPatientAnalyticsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  const prescriptions = await db.select().from(prescriptionsTable)
    .where(eq(prescriptionsTable.patientId, params.data.id))
    .orderBy(desc(prescriptionsTable.createdAt));

  // Monthly visit counts (last 6 months)
  const monthlyMap: Record<string, number> = {};
  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  for (const p of prescriptions) {
    const d = new Date(p.createdAt);
    const key = months[d.getMonth()];
    monthlyMap[key] = (monthlyMap[key] ?? 0) + 1;
  }

  // Diagnosis distribution
  const diagMap: Record<string, number> = {};
  for (const p of prescriptions) {
    if (p.diagnosis) {
      diagMap[p.diagnosis] = (diagMap[p.diagnosis] ?? 0) + 1;
    }
  }

  res.json({
    totalVisits: patient.totalVisits,
    firstVisit: patient.firstVisit?.toISOString() ?? null,
    lastVisit: patient.lastVisit?.toISOString() ?? null,
    topDiagnosis: patient.topDiagnosis,
    monthlyVisits: Object.entries(monthlyMap).map(([month, count]) => ({ month, count })),
    diagnosisDistribution: Object.entries(diagMap).map(([diagnosis, count]) => ({ diagnosis, count })),
  });
});

router.get("/patients/:id/prescriptions", async (req, res): Promise<void> => {
  const params = GetPatientPrescriptionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const prescriptions = await db.select().from(prescriptionsTable)
    .where(eq(prescriptionsTable.patientId, params.data.id))
    .orderBy(desc(prescriptionsTable.createdAt));

  res.json(prescriptions.map(p => ({
    id: p.id,
    patientId: p.patientId,
    doctorId: p.doctorId,
    diagnosis: p.diagnosis,
    drugs: p.drugs,
    notes: p.notes,
    status: p.status,
    prescriptionCode: p.prescriptionCode,
    createdAt: p.createdAt.toISOString(),
  })));
});

export default router;
