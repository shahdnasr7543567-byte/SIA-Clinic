import { Router } from "express";
import {
  registerPatient,
  loginPatient,
  logoutPatient,
} from "../controllers/patientAuth.controller.js";

const router = Router();

router.post("/register", registerPatient);
router.post("/login", loginPatient);
router.post("/logout", logoutPatient);

export default router;
