import { Router } from "express";
import {
  chatWithAI,
  lookupPatientForAI,
  getAvailabilityForAI,
} from "../controllers/ai.controller.js";
import { resolvePublicTenant } from "../middlewares/tenant.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { aiChatSchema } from "../validators/index.js";

const router = Router();

router.post("/chat", resolvePublicTenant, validateBody(aiChatSchema), chatWithAI);
router.get("/patient-lookup", resolvePublicTenant, lookupPatientForAI);
router.get("/availability", resolvePublicTenant, getAvailabilityForAI);

export default router;
