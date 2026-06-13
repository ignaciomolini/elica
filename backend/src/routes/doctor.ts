import { Router } from "express";
import multer from "multer";
import path from "path";
import * as doctorPanelController from "../controllers/doctorPanelController.js";
import * as doctorScheduleController from "../controllers/doctorScheduleController.js";
import * as uploadController from "../controllers/uploadController.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve("uploads/avatars"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const router = Router();

// Doctor stats
router.get("/stats", doctorPanelController.getStats);

// Doctor profile
router.put("/profile", doctorPanelController.updateProfile);

// Avatar upload
router.post("/avatar", upload.single("avatar"), uploadController.uploadAvatar);

// Doctor's own appointments
router.get("/appointments", doctorPanelController.getAppointments);

// Doctor manages own time slots
router.get("/slots", doctorPanelController.getAllSlots);
router.post("/slots", doctorPanelController.createSlots);
router.delete("/slots/:slotId", doctorPanelController.deleteSlot);

// Doctor weekly schedule configuration
router.get("/schedule", doctorScheduleController.getSchedule);
router.put("/schedule", doctorScheduleController.updateSchedule);

// Temporal: verificar turnos generados
router.get("/verify-slots", async (req: any, res) => {
  const prisma = (await import("../lib/prisma.js")).default;
  const doctorId = req.doctor.doctorId;
  
  const schedule = await prisma.doctorSchedule.findMany({
    where: { doctorId }
  });
  
  const slots = await prisma.timeSlot.findMany({
    where: { doctorId },
    orderBy: { date: "asc" },
    take: 50
  });
  
  res.json({ schedule, slotsCount: slots.length, slots });
});

// Doctor creates a confirmed appointment (skip SMS verification)
router.post("/appointments", doctorPanelController.createConfirmedAppointment);

// Doctor updates appointment patient details
router.put("/appointments/:id/patient", doctorPanelController.updateAppointmentPatient);

// Doctor updates appointment status
router.put("/appointments/:id/status", doctorPanelController.updateAppointmentStatus);

// Doctor deletes appointment
router.delete("/appointments/:id", doctorPanelController.deleteAppointment);

export default router;
