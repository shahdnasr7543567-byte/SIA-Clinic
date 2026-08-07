import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mobile: text("mobile").notNull(),
  age: integer("age").notNull(),
  priority: text("priority", { enum: ["normal", "urgent", "critical"] }).notNull().default("normal"),
  visitType: text("visit_type", { enum: ["new", "followup"] }).notNull().default("new"),
  examType: text("exam_type", { enum: ["clinic", "home", "online"] }).notNull().default("clinic"),
  bookingType: text("booking_type", { enum: ["online", "cash", "instapay"] }).notNull().default("cash"),
  status: text("status", { enum: ["waiting", "done", "cancelled"] }).notNull().default("waiting"),
  notes: text("notes"),
  chronicDiseases: text("chronic_diseases"),
  allergies: text("allergies"),
  totalVisits: integer("total_visits").notNull().default(0),
  firstVisit: timestamp("first_visit", { withTimezone: true }),
  lastVisit: timestamp("last_visit", { withTimezone: true }),
  topDiagnosis: text("top_diagnosis"),
  userId: integer("user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPatientSchema = createInsertSchema(patientsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patientsTable.$inferSelect;
