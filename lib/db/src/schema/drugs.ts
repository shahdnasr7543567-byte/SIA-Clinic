import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const drugsTable = pgTable("drugs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  form: text("form", { enum: ["tablet", "syrup", "ointment", "injection", "spray", "capsule", "drops", "other"] }).notNull().default("tablet"),
  interactions: text("interactions"),
  contraindications: text("contraindications"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDrugSchema = createInsertSchema(drugsTable).omit({ id: true, createdAt: true });
export type InsertDrug = z.infer<typeof insertDrugSchema>;
export type Drug = typeof drugsTable.$inferSelect;
