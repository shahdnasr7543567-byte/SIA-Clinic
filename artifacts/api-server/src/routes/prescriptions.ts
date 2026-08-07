import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, prescriptionsTable, patientsTable, usersTable } from "@workspace/db";
import {
  CreatePrescriptionBody,
  UpdatePrescriptionBody,
  GetPrescriptionParams,
  UpdatePrescriptionParams,
  ListPrescriptionsQueryParams,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

function formatPatient(p: typeof patientsTable.$inferSelect) {
  return {
    id: p.id, name: p.name, mobile: p.mobile, age: p.age, priority: p.priority,
    visitType: p.visitType, examType: p.examType, bookingType: p.bookingType, status: p.status,
    notes: p.notes, chronicDiseases: p.chronicDiseases, allergies: p.allergies,
    totalVisits: p.totalVisits, firstVisit: p.firstVisit?.toISOString() ?? null,
    lastVisit: p.lastVisit?.toISOString() ?? null, topDiagnosis: p.topDiagnosis,
    userId: p.userId, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(),
  };
}

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id, name: u.name, email: u.email, role: u.role, mobile: u.mobile,
    specialty: u.specialty, avatarUrl: u.avatarUrl, createdAt: u.createdAt.toISOString(),
  };
}

async function formatPrescription(p: typeof prescriptionsTable.$inferSelect) {
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, p.patientId));
  const [doctor] = await db.select().from(usersTable).where(eq(usersTable.id, p.doctorId));
  return {
    id: p.id,
    patientId: p.patientId,
    patient: patient ? formatPatient(patient) : undefined,
    doctorId: p.doctorId,
    doctor: doctor ? formatUser(doctor) : undefined,
    diagnosis: p.diagnosis,
    drugs: p.drugs,
    notes: p.notes,
    status: p.status,
    prescriptionCode: p.prescriptionCode,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/prescriptions", async (req, res): Promise<void> => {
  const query = ListPrescriptionsQueryParams.safeParse(req.query);
  const conditions = [];
  if (query.success && query.data.patientId) {
    conditions.push(eq(prescriptionsTable.patientId, Math.round(query.data.patientId)));
  }
  if (query.success && query.data.doctorId) {
    conditions.push(eq(prescriptionsTable.doctorId, Math.round(query.data.doctorId)));
  }
  if (query.success && query.data.status) {
    conditions.push(eq(prescriptionsTable.status, query.data.status as "active" | "dispensed" | "cancelled"));
  }

  const prescriptions = conditions.length > 0
    ? await db.select().from(prescriptionsTable).where(and(...conditions)).orderBy(desc(prescriptionsTable.createdAt))
    : await db.select().from(prescriptionsTable).orderBy(desc(prescriptionsTable.createdAt));

  const formatted = await Promise.all(prescriptions.map(formatPrescription));
  res.json(formatted);
});

router.post("/prescriptions", async (req, res): Promise<void> => {
  const parsed = CreatePrescriptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const code = "RX-" + randomUUID().split("-")[0].toUpperCase();
  const [prescription] = await db.insert(prescriptionsTable).values({
    patientId: Math.round(parsed.data.patientId),
    doctorId: Math.round(parsed.data.doctorId),
    diagnosis: parsed.data.diagnosis,
    drugs: parsed.data.drugs as unknown[],
    notes: parsed.data.notes,
    prescriptionCode: code,
  }).returning();

  // Update patient's last visit and top diagnosis
  await db.update(patientsTable)
    .set({
      lastVisit: new Date(),
      topDiagnosis: parsed.data.diagnosis,
    })
    .where(eq(patientsTable.id, Math.round(parsed.data.patientId)));

  res.status(201).json(await formatPrescription(prescription));
});

router.get("/prescriptions/:id", async (req, res): Promise<void> => {
  const params = GetPrescriptionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [prescription] = await db.select().from(prescriptionsTable).where(eq(prescriptionsTable.id, params.data.id));
  if (!prescription) {
    res.status(404).json({ error: "Prescription not found" });
    return;
  }

  res.json(await formatPrescription(prescription));
});

router.patch("/prescriptions/:id", async (req, res): Promise<void> => {
  const params = UpdatePrescriptionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePrescriptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [prescription] = await db.update(prescriptionsTable)
    .set(parsed.data as Partial<typeof prescriptionsTable.$inferInsert>)
    .where(eq(prescriptionsTable.id, params.data.id))
    .returning();

  if (!prescription) {
    res.status(404).json({ error: "Prescription not found" });
    return;
  }

  res.json(await formatPrescription(prescription));
});

export default router;
