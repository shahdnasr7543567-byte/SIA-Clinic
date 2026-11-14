import { Router } from "express";
import {
  getDoctorStats,
  getDoctorQueue,
  createPrescription,
  getPrescriptionById,
  sendToPharmacy,
} from "../controllers/doctor.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTenant } from "../middlewares/tenant.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { createPrescriptionSchema } from "../validators/index.js";

const router = Router();

router.use(authenticate, requireTenant, requireRole("admin", "doctor"));

router.get("/stats", getDoctorStats);
router.get("/queue", getDoctorQueue);
router.post("/prescriptions", validateBody(createPrescriptionSchema), createPrescription);
router.get("/prescriptions/:id", getPrescriptionById);
router.post("/prescriptions/:id/send-to-pharmacy", sendToPharmacy);

export default router;
