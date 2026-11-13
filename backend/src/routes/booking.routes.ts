import { Router } from "express";
import {
  createOnlineBooking,
  checkCapacity,
} from "../controllers/booking.controller.js";
import { resolvePublicTenant } from "../middlewares/tenant.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { authenticatedBookingSchema, onlineBookingSchema } from "../validators/index.js";
import { authenticatePatient } from "../middlewares/patientAuth.middleware.js";
import { AuthRequest } from "../types/index.js";

const router = Router();

// Public booking routes
router.post("/", (req, res, next) => {
  if (req.headers.authorization) return authenticatePatient(req, res, next);
  return resolvePublicTenant(req, res, next);
}, (req, res, next) => {
  const schema = (req as AuthRequest).patient ? authenticatedBookingSchema : onlineBookingSchema;
  return validateBody(schema)(req, res, next);
}, createOnlineBooking);
router.get("/capacity-check", resolvePublicTenant, checkCapacity);

export default router;
