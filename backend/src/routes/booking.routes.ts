import { Router } from "express";
import {
  createOnlineBooking,
  checkCapacity,
} from "../controllers/booking.controller.js";
import { resolvePublicTenant } from "../middlewares/tenant.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { onlineBookingSchema } from "../validators/index.js";

const router = Router();

// Public booking routes
router.post("/", resolvePublicTenant, validateBody(onlineBookingSchema), createOnlineBooking);
router.get("/capacity-check", resolvePublicTenant, checkCapacity);

export default router;
