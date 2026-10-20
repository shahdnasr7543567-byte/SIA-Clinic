import { Router } from "express";
import {
  getQueueStatus,
  getMyBookings,
  getMyPrescriptions,
  getMyPrescriptionById,
  getMyMedicalProfile,
} from "../controllers/patientPortal.controller.js";
import { authenticatePatient } from "../middlewares/patientAuth.middleware.js";

const router = Router();

router.use(authenticatePatient);

router.get("/queue-status", getQueueStatus);
router.get("/bookings", getMyBookings);
router.get("/prescriptions", getMyPrescriptions);
router.get("/prescriptions/:id", getMyPrescriptionById);
router.get("/medical-profile", getMyMedicalProfile);

export default router;
