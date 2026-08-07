import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";
import { usersTable } from "./users";

export const queueTable = pgTable("queue", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id),
  doctorId: integer("doctor_id").references(() => usersTable.id),
  status: text("status", { enum: ["waiting", "called", "done", "cancelled"] }).notNull().default("waiting"),
  priority: text("priority", { enum: ["normal", "urgent", "critical"] }).notNull().default("normal"),
  notes: text("notes"),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const insertQueueSchema = createInsertSchema(queueTable).omit({ id: true, addedAt: true });
export type InsertQueue = z.infer<typeof insertQueueSchema>;
export type QueueEntry = typeof queueTable.$inferSelect;
