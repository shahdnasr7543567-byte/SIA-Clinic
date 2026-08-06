import { Router, type IRouter } from "express";
import { eq, and, gte, desc } from "drizzle-orm";
import { db, appointmentsTable, patientsTable } from "@workspace/db";
import {
  CreateAppointmentBody,
  UpdateAppointmentBody,
  UpdateAppointmentParams,
  ListAppointmentsQueryParams,
} from "@workspace/api-zod";

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

router.get("/appointments", async (req, res): Promise<void> => {
  const query = ListAppointmentsQueryParams.safeParse(req.query);
  const conditions = [];
  if (query.success && query.data.patientId) {
    conditions.push(eq(appointmentsTable.patientId, Math.round(query.data.patientId)));
  }
  if (query.success && query.data.doctorId) {
    conditions.push(eq(appointmentsTable.doctorId, Math.round(query.data.doctorId)));
  }
  if (query.success && query.data.upcoming) {
    const today = new Date().toISOString().split("T")[0];
    conditions.push(gte(appointmentsTable.scheduledDate, today));
  }

  const appointments = conditions.length > 0
    ? await db.select().from(appointmentsTable).where(and(...conditions)).orderBy(appointmentsTable.scheduledDate)
    : await db.select().from(appointmentsTable).orderBy(appointmentsTable.scheduledDate);

  const formatted = await Promise.all(appointments.map(async (a) => {
    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, a.patientId));
    return {
      id: a.id,
      patientId: a.patientId,
      patient: patient ? formatPatient(patient) : undefined,
      doctorId: a.doctorId,
      scheduledDate: a.scheduledDate,
      notes: a.notes,
      status: a.status,
      reminderType: a.reminderType,
      createdAt: a.createdAt.toISOString(),
    };
  }));

  res.json(formatted);
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [appointment] = await db.insert(appointmentsTable).values({
    patientId: Math.round(parsed.data.patientId),
    doctorId: parsed.data.doctorId ? Math.round(parsed.data.doctorId) : undefined,
    scheduledDate: parsed.data.scheduledDate,
    notes: parsed.data.notes,
    reminderType: parsed.data.reminderType,
  }).returning();

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, appointment.patientId));

  res.status(201).json({
    id: appointment.id,
    patientId: appointment.patientId,
    patient: patient ? formatPatient(patient) : undefined,
    doctorId: appointment.doctorId,
    scheduledDate: appointment.scheduledDate,
    notes: appointment.notes,
    status: appointment.status,
    reminderType: appointment.reminderType,
    createdAt: appointment.createdAt.toISOString(),
  });
});

router.patch("/appointments/:id", async (req, res): Promise<void> => {
  const params = UpdateAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [appointment] = await db.update(appointmentsTable)
    .set(parsed.data as Partial<typeof appointmentsTable.$inferInsert>)
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();

  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, appointment.patientId));

  res.json({
    id: appointment.id,
    patientId: appointment.patientId,
    patient: patient ? formatPatient(patient) : undefined,
    doctorId: appointment.doctorId,
    scheduledDate: appointment.scheduledDate,
    notes: appointment.notes,
    status: appointment.status,
    reminderType: appointment.reminderType,
    createdAt: appointment.createdAt.toISOString(),
  });
});

export default router;
