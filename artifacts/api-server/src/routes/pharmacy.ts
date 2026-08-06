import { Router, type IRouter } from "express";
import { like, and, eq, lte, desc } from "drizzle-orm";
import { db, inventoryTable, prescriptionsTable, patientsTable, usersTable } from "@workspace/db";
import {
  CreateInventoryItemBody,
  UpdateInventoryItemBody,
  UpdateInventoryItemParams,
  DispensePrescriptionBody,
  ListInventoryQueryParams,
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

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id, name: u.name, email: u.email, role: u.role, mobile: u.mobile,
    specialty: u.specialty, avatarUrl: u.avatarUrl, createdAt: u.createdAt.toISOString(),
  };
}

router.get("/pharmacy/inventory", async (req, res): Promise<void> => {
  const query = ListInventoryQueryParams.safeParse(req.query);
  const search = query.success ? query.data.search : undefined;
  const lowStock = query.success ? query.data.lowStock : undefined;

  const conditions = [];
  if (search) conditions.push(like(inventoryTable.drugName, `%${search}%`));

  const items = conditions.length > 0
    ? await db.select().from(inventoryTable).where(and(...conditions))
    : await db.select().from(inventoryTable);

  let result = items.map(item => ({
    id: item.id,
    drugId: item.drugId,
    drugName: item.drugName,
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
    minimumStock: item.minimumStock,
    expiryDate: item.expiryDate,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  if (lowStock === true || lowStock === "true" as unknown) {
    result = result.filter(i => i.quantity <= i.minimumStock);
  }

  res.json(result);
});

router.post("/pharmacy/inventory", async (req, res): Promise<void> => {
  const parsed = CreateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(inventoryTable).values({
    ...parsed.data,
    drugId: Math.round(parsed.data.drugId),
    quantity: Math.round(parsed.data.quantity),
    minimumStock: parsed.data.minimumStock ? Math.round(parsed.data.minimumStock) : 10,
  }).returning();

  res.status(201).json({
    id: item.id,
    drugId: item.drugId,
    drugName: item.drugName,
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
    minimumStock: item.minimumStock,
    expiryDate: item.expiryDate,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  });
});

router.patch("/pharmacy/inventory/:id", async (req, res): Promise<void> => {
  const params = UpdateInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.quantity !== undefined) updateData.quantity = Math.round(parsed.data.quantity);
  if (parsed.data.minimumStock !== undefined) updateData.minimumStock = Math.round(parsed.data.minimumStock);

  const [item] = await db.update(inventoryTable)
    .set(updateData as Partial<typeof inventoryTable.$inferInsert>)
    .where(eq(inventoryTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Inventory item not found" });
    return;
  }

  res.json({
    id: item.id,
    drugId: item.drugId,
    drugName: item.drugName,
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
    minimumStock: item.minimumStock,
    expiryDate: item.expiryDate,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  });
});

router.post("/pharmacy/dispense", async (req, res): Promise<void> => {
  const parsed = DispensePrescriptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [prescription] = await db.update(prescriptionsTable)
    .set({ status: "dispensed" })
    .where(eq(prescriptionsTable.id, Math.round(parsed.data.prescriptionId)))
    .returning();

  if (!prescription) {
    res.status(404).json({ error: "Prescription not found" });
    return;
  }

  const [patient] = prescription.patientId
    ? await db.select().from(patientsTable).where(eq(patientsTable.id, prescription.patientId))
    : [];
  const [doctor] = prescription.doctorId
    ? await db.select().from(usersTable).where(eq(usersTable.id, prescription.doctorId))
    : [];

  res.json({
    id: prescription.id,
    patientId: prescription.patientId,
    patient: patient ? formatPatient(patient) : undefined,
    doctorId: prescription.doctorId,
    doctor: doctor ? formatUser(doctor) : undefined,
    diagnosis: prescription.diagnosis,
    drugs: prescription.drugs,
    notes: prescription.notes,
    status: prescription.status,
    prescriptionCode: prescription.prescriptionCode,
    createdAt: prescription.createdAt.toISOString(),
  });
});

router.get("/pharmacy/dispensed", async (req, res): Promise<void> => {
  const prescriptions = await db.select().from(prescriptionsTable)
    .where(eq(prescriptionsTable.status, "dispensed"))
    .orderBy(desc(prescriptionsTable.createdAt))
    .limit(50);

  const formatted = await Promise.all(prescriptions.map(async (p) => {
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
  }));

  res.json(formatted);
});

export default router;
