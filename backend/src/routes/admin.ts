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
router.delete("/appointments/:id", adminController.deleteAppointment);

// Stats
router.get("/stats", adminController.getStats);

export default router;
