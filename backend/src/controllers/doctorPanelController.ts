import { Response, NextFunction } from "express";
import { z } from "zod";
import * as appointmentService from "../services/appointmentService.js";
import * as doctorService from "../services/doctorService.js";
import { AuthRequest } from "../middleware/auth.js";
import { AppointmentStatus } from "@prisma/client";

const createTimeSlotsSchema = z.object({
  date: z.string({
    error: "La fecha es requerida",
  }).min(1, "La fecha es requerida"),
  slots: z.array(z.object({ startTime: z.string(), endTime: z.string() })),
});

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"], {
    error: "El estado debe ser PENDING, CONFIRMED o CANCELLED",
  }),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  bio: z.string().optional(),
  avatar: z.string().url("Debe ser una URL valida").optional(),
});

export async function getAppointments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doctorId = req.doctor!.doctorId;
    const appointments = await appointmentService.getDoctorAppointments(doctorId);
    res.json(appointments);
  } catch (err) {
    next(err);
  }
}

export async function createSlots(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doctorId = req.doctor!.doctorId;
    const { date, slots } = createTimeSlotsSchema.parse(req.body);
    const created = await doctorService.createTimeSlots(doctorId, date, slots);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function deleteSlot(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doctorId = req.doctor!.doctorId;
    const slotId = req.params.slotId as string;
    await doctorService.deleteTimeSlot(slotId, doctorId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function updateAppointmentStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { status } = updateStatusSchema.parse(req.body);
    const appointment = await appointmentService.updateAppointmentStatus(
      id,
      status as AppointmentStatus
    );
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

export async function deleteAppointment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doctorId = req.doctor!.doctorId;
    const appointmentId = req.params.id as string;
    
    // Verify the appointment belongs to this doctor
    const appointments = await appointmentService.getDoctorAppointments(doctorId);
    const appointment = appointments.find(a => a.id === appointmentId);
    
    if (!appointment) {
      res.status(404).json({ error: "Turno no encontrado o no pertenece a este médico" });
      return;
    }
    
    const result = await appointmentService.deleteAppointment(appointmentId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doctorId = req.doctor!.doctorId;
    const stats = await doctorService.getDoctorStats(doctorId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doctorId = req.doctor!.doctorId;
    const data = updateProfileSchema.parse(req.body);
    const updated = await doctorService.updateDoctor(doctorId, data);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function getAllSlots(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doctorId = req.doctor!.doctorId;
    const date = req.query.date as string;

    if (!date) {
      res.status(400).json({ error: "La fecha es requerida como parametro de consulta" });
      return;
    }

    const slots = await doctorService.getDoctorAllSlots(doctorId, date);
    res.json(slots);
  } catch (err) {
    next(err);
  }
}
