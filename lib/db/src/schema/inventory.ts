import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { drugsTable } from "./drugs";

export const inventoryTable = pgTable("inventory", {
  id: serial("id").primaryKey(),
  drugId: integer("drug_id").notNull().references(() => drugsTable.id),
  drugName: text("drug_name").notNull(),
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull().default("tablet"),
  price: real("price").notNull().default(0),
  minimumStock: integer("minimum_stock").notNull().default(10),
  expiryDate: text("expiry_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInventorySchema = createInsertSchema(inventoryTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InventoryItem = typeof inventoryTable.$inferSelect;
