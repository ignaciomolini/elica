import { Router } from "express";
import * as doctorController from "../controllers/doctorController.js";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", doctorController.getAll);
router.get("/:id", doctorController.getById);
router.get("/:id/slots", doctorController.getSlots);

// Get doctor's weekly schedule configuration
router.get("/:id/schedule", async (req, res) => {
  try {
    const doctorId = req.params.id;
    const schedules = await prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: "asc" },
    });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener la configuración" });
  }
});

// Temporal: verificar timeSlots
router.get("/:id/check-slots", async (req, res) => {
  try {
    const doctorId = req.params.id;
    const slots = await prisma.timeSlot.findMany({
      where: { doctorId },
      orderBy: { date: "asc" },
      take: 10,
    });
    const total = await prisma.timeSlot.count({ where: { doctorId } });
    res.json({ total, sample: slots });
  } catch (err) {
    res.status(500).json({ error: "Error al verificar timeSlots" });
  }
});

export default router;

