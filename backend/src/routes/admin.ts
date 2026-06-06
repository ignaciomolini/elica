import { Router } from "express";
import * as adminController from "../controllers/adminController.js";

const router = Router();

// Specialties CRUD
router.get("/specialties", adminController.getSpecialties);
router.post("/specialties", adminController.createSpecialty);
router.put("/specialties/:id", adminController.updateSpecialty);
router.delete("/specialties/:id", adminController.deleteSpecialty);

// Doctors CRUD
router.get("/doctors", adminController.getDoctors);
router.post("/doctors", adminController.createDoctor);
router.put("/doctors/:id", adminController.updateDoctor);
router.delete("/doctors/:id", adminController.deleteDoctor);

// Appointments
router.get("/appointments", adminController.getAppointments);
router.post("/appointments", adminController.createAppointment);
router.delete("/appointments/:id", adminController.deleteAppointment);
router.put("/appointments/:id/cancel", adminController.cancelAppointment);
router.put("/appointments/:id/reschedule", adminController.rescheduleAppointment);

// Stats
router.get("/stats", adminController.getStats);

export default router;
