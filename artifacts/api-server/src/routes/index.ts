import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import patientsRouter from "./patients";
import queueRouter from "./queue";
import prescriptionsRouter from "./prescriptions";
import drugsRouter from "./drugs";
import pharmacyRouter from "./pharmacy";
import appointmentsRouter from "./appointments";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(patientsRouter);
router.use(queueRouter);
router.use(prescriptionsRouter);
router.use(drugsRouter);
router.use(pharmacyRouter);
router.use(appointmentsRouter);
router.use(dashboardRouter);

export default router;
