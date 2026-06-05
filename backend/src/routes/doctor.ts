import { Router } from "express";
import * as doctorPanelController from "../controllers/doctorPanelController.js";
import * as doctorScheduleController from "../controllers/doctorScheduleController.js";

const router = Router();

// Doctor stats
router.get("/stats", doctorPanelController.getStats);

// Doctor profile
router.put("/profile", doctorPanelController.updateProfile);

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

// Doctor updates appointment status
router.put("/appointments/:id/status", doctorPanelController.updateAppointmentStatus);

// Doctor deletes appointment
router.delete("/appointments/:id", doctorPanelController.deleteAppointment);

export default router;
