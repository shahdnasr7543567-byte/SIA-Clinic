import { Router } from "express";
import {
  getReceptionStats,
  getReceptionQueue,
  addPatientToQueue,
  updateQueueStatus,
} from "../controllers/reception.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTenant } from "../middlewares/tenant.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  addQueuePatientSchema,
  updateQueueStatusSchema,
} from "../validators/index.js";

const router = Router();

router.use(authenticate, requireTenant, requireRole("admin", "receptionist"));

router.get("/stats", getReceptionStats);
router.get("/queue", getQueueWrapper);
router.post("/patients", validateBody(addQueuePatientSchema), addPatientToQueue);
router.patch("/queue/:id", validateBody(updateQueueStatusSchema), updateQueueStatus);

function getQueueWrapper(req: any, res: any, next: any) {
  return getReceptionQueue(req, res, next);
}

export default router;
