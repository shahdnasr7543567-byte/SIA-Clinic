import { Router } from "express";
import {
  searchPatients,
  getPatientById,
  getPatientMedicalInfo,
  getPatientStats,
  getPrescriptionHistory,
  getPatientReminders,
  createPatientReminder,
} from "../controllers/patient.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTenant } from "../middlewares/tenant.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { createReminderSchema } from "../validators/index.js";

const router = Router();

router.use(authenticate, requireTenant);

router.get("/search", searchPatients);
router.get("/:id", getPatientById);
router.get("/:id/medical", getPatientMedicalInfo);
router.get("/:id/stats", getPatientStats);
router.get("/:id/history", getPrescriptionHistory);
router.get("/:id/reminders", getPatientReminders);
router.post("/:id/reminders", validateBody(createReminderSchema), createPatientReminder);

export default router;
