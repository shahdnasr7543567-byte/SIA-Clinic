import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";
import { usersTable } from "./users";

export const prescriptionsTable = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id),
  doctorId: integer("doctor_id").notNull().references(() => usersTable.id),
  diagnosis: text("diagnosis").notNull(),
  drugs: jsonb("drugs").notNull().default([]),
  notes: text("notes"),
  status: text("status", { enum: ["active", "dispensed", "cancelled"] }).notNull().default("active"),
  prescriptionCode: text("prescription_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPrescriptionSchema = createInsertSchema(prescriptionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Prescription = typeof prescriptionsTable.$inferSelect;
