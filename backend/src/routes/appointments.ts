import { Router } from "express";
import * as appointmentController from "../controllers/appointmentController.js";

const router = Router();

// Public routes
router.post("/", appointmentController.create);
router.post("/verify", appointmentController.verify);
router.get("/pending", appointmentController.getPending);
router.get("/pending-by-token", appointmentController.getPendingByToken);
router.post("/:id/resend-code", appointmentController.resendCode);
router.get("/", appointmentController.getByPatient);
router.delete("/:id", appointmentController.cancel);

export default router;
