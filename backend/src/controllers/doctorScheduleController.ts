import { Response, NextFunction } from "express";
import { z } from "zod";
import * as doctorScheduleService from "../services/doctorScheduleService.js";
import { AuthRequest } from "../middleware/auth.js";

const scheduleItemSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "El formato debe ser HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "El formato debe ser HH:MM"),
  interval: z.number().int().positive(),
  enabled: z.boolean(),
});

const updateScheduleSchema = z.object({
  schedules: z.array(scheduleItemSchema).min(1, "Debe incluir al menos un día"),
});

export async function getSchedule(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doctorId = req.doctor!.doctorId;
    const schedules = await doctorScheduleService.getDoctorSchedule(doctorId);
    res.json(schedules);
  } catch (err) {
    next(err);
  }
}

export async function updateSchedule(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doctorId = req.doctor!.doctorId;
    console.log(`[SCHEDULE CONTROLLER] Updating schedule for doctor ${doctorId}`);
    console.log(`[SCHEDULE CONTROLLER] Request body:`, req.body);
    
    const { schedules } = updateScheduleSchema.parse(req.body);

    // Validate endTime > startTime for enabled schedules
    for (const s of schedules) {
      if (!s.enabled) continue;
      if (s.endTime <= s.startTime) {
        res.status(400).json({
          error: `El horario de cierre debe ser mayor al de apertura (día ${s.dayOfWeek})`,
        });
        return;
      }
    }

    await doctorScheduleService.updateDoctorSchedule(doctorId, schedules);
    console.log(`[SCHEDULE CONTROLLER] Schedule updated successfully`);
    
    res.json({ message: "Configuración guardada y turnos generados" });
  } catch (err) {
    console.error(`[SCHEDULE CONTROLLER] Error:`, err);
    next(err);
  }
}
