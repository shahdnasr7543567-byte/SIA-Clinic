import { Router } from "express";
import authRoutes from "./auth.routes.js";
import patientRoutes from "./patient.routes.js";
import receptionRoutes from "./reception.routes.js";
import doctorRoutes from "./doctor.routes.js";
import bookingRoutes from "./booking.routes.js";
import aiRoutes from "./ai.routes.js";
import paymentRoutes from "./payment.routes.js";
import publicRoutes from "./public.routes.js";

const apiRouter = Router();

// Health check endpoint
apiRouter.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SIA Clinic Backend API",
    version: "1.0.0",
    database: "MongoDB",
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use("/auth", authRoutes);
apiRouter.use("/patients", patientRoutes);
apiRouter.use("/reception", receptionRoutes);
apiRouter.use("/doctor", doctorRoutes);
apiRouter.use("/bookings", bookingRoutes);
apiRouter.use("/ai", aiRoutes);
apiRouter.use("/payments", paymentRoutes);
apiRouter.use("/public", publicRoutes);

export default apiRouter;
