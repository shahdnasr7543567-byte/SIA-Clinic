import { Router } from "express";
import {
  searchDrugs,
  getPublicPrescription,
} from "../controllers/drug.controller.js";

const router = Router();

router.get("/drugs", searchDrugs);
router.get("/prescriptions/:id", getPublicPrescription);

export default router;
