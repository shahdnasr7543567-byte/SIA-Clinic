import { Router, type IRouter } from "express";
import { eq, and, like, or, desc } from "drizzle-orm";
import { db, queueTable, patientsTable } from "@workspace/db";
import {
  AddToQueueBody,
  UpdateQueueEntryBody,
  UpdateQueueEntryParams,
  ListQueueQueryParams,
} from "@workspace/api-zod";

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

router.get("/queue", async (req, res): Promise<void> => {
  const query = ListQueueQueryParams.safeParse(req.query);
  const doctorId = query.success ? query.data.doctorId : undefined;
  const search = query.success ? query.data.search : undefined;

  let conditions: ReturnType<typeof eq>[] = [eq(queueTable.status, "waiting")];
  if (doctorId) {
    conditions.push(eq(queueTable.doctorId, Math.round(doctorId)));
  }

  const entries = await db.select({
    queue: queueTable,
    patient: patientsTable,
  })
    .from(queueTable)
    .innerJoin(patientsTable, eq(queueTable.patientId, patientsTable.id))
    .where(and(...conditions))
    .orderBy(desc(queueTable.addedAt));

  let result = entries.map(({ queue, patient }) => ({
    id: queue.id,
    patientId: queue.patientId,
    patient: formatPatient(patient),
    doctorId: queue.doctorId,
    status: queue.status,
    priority: queue.priority,
    notes: queue.notes,
    addedAt: queue.addedAt.toISOString(),
    completedAt: queue.completedAt?.toISOString() ?? null,
  }));

  if (search) {
    const lc = search.toLowerCase();
    result = result.filter(e =>
      e.patient.name.toLowerCase().includes(lc) ||
      e.patient.mobile.includes(lc)
    );
  }

  res.json(result);
});

router.post("/queue", async (req, res): Promise<void> => {
  const parsed = AddToQueueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db.insert(queueTable).values({
    patientId: Math.round(parsed.data.patientId),
    doctorId: parsed.data.doctorId ? Math.round(parsed.data.doctorId) : undefined,
    priority: parsed.data.priority,
    notes: parsed.data.notes,
  }).returning();

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, entry.patientId));

  res.status(201).json({
    id: entry.id,
    patientId: entry.patientId,
    patient: patient ? formatPatient(patient) : undefined,
    doctorId: entry.doctorId,
    status: entry.status,
    priority: entry.priority,
    notes: entry.notes,
    addedAt: entry.addedAt.toISOString(),
    completedAt: entry.completedAt?.toISOString() ?? null,
  });
});

router.patch("/queue/:id", async (req, res): Promise<void> => {
  const params = UpdateQueueEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateQueueEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "done" || parsed.data.status === "cancelled") {
    updateData.completedAt = new Date();
  }

  const [entry] = await db.update(queueTable)
    .set(updateData as Partial<typeof queueTable.$inferInsert>)
    .where(eq(queueTable.id, params.data.id))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Queue entry not found" });
    return;
  }

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, entry.patientId));

  res.json({
    id: entry.id,
    patientId: entry.patientId,
    patient: patient ? formatPatient(patient) : undefined,
    doctorId: entry.doctorId,
    status: entry.status,
    priority: entry.priority,
    notes: entry.notes,
    addedAt: entry.addedAt.toISOString(),
    completedAt: entry.completedAt?.toISOString() ?? null,
  });
});

export default router;
