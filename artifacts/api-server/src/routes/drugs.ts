import { Router, type IRouter } from "express";
import { like, and, eq } from "drizzle-orm";
import { db, drugsTable } from "@workspace/db";
import { CreateDrugBody, ListDrugsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/drugs", async (req, res): Promise<void> => {
  const query = ListDrugsQueryParams.safeParse(req.query);
  const search = query.success ? query.data.search : undefined;
  const form = query.success ? query.data.form : undefined;

  const conditions = [];
  if (search) conditions.push(like(drugsTable.name, `%${search}%`));
  if (form) conditions.push(eq(drugsTable.form, form as typeof drugsTable.$inferSelect["form"]));

  const drugs = conditions.length > 0
    ? await db.select().from(drugsTable).where(and(...conditions))
    : await db.select().from(drugsTable);

  res.json(drugs.map(d => ({
    id: d.id,
    name: d.name,
    genericName: d.genericName,
    form: d.form,
    interactions: d.interactions,
    contraindications: d.contraindications,
    createdAt: d.createdAt.toISOString(),
  })));
});

router.post("/drugs", async (req, res): Promise<void> => {
  const parsed = CreateDrugBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [drug] = await db.insert(drugsTable).values(parsed.data as typeof drugsTable.$inferInsert).returning();

  res.status(201).json({
    id: drug.id,
    name: drug.name,
    genericName: drug.genericName,
    form: drug.form,
    interactions: drug.interactions,
    contraindications: drug.contraindications,
    createdAt: drug.createdAt.toISOString(),
  });
});

export default router;
