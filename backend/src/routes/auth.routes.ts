import { Router } from "express";
import {
  login,
  register,
  forgotPassword,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from "../validators/index.js";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

export default router;
