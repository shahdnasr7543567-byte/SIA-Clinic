import { Router } from "express";
import {
  handlePaymentWebhook,
  createPaymentIntent,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/webhook", handlePaymentWebhook);
router.post("/create-intent", createPaymentIntent);

export default router;
