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

const createConfirmedAppointmentSchema = z.object({
  timeSlotId: z.string().min(1, "El horario es requerido"),
  patientName: z.string().min(2, "El nombre del paciente debe tener al menos 2 caracteres"),
  patientEmail: z.string().email("El email no es válido"),
  patientPhone: z.string().min(1, "El teléfono es requerido"),
  patientDni: z.string().min(1, "El DNI es requerido"),
});

const updateAppointmentPatientSchema = z.object({
  patientName: z.string().min(2, "El nombre del paciente debe tener al menos 2 caracteres").optional(),
  patientEmail: z.string().email("El email no es válido").optional(),
  patientPhone: z.string().min(1, "El teléfono es requerido").optional(),
  patientDni: z.string().min(1, "El DNI es requerido").optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates that a date string is a semantically valid ISO 8601 date (YYYY-MM-DD).
 * `Date.parse()` silently corrects overflow dates (e.g. "2026-02-31" → Mar 3),
 * so we round-trip through Date and compare the result to reject such inputs.
 */
function isValidISODate(str: string): boolean {
  if (!ISO_DATE_REGEX.test(str)) return false;
  const parsed = Date.parse(str);
  if (isNaN(parsed)) return false;
  // Round-trip check: "2026-02-31" parses as Mar 3, which !== "2026-02-31"
  return new Date(parsed).toISOString().slice(0, 10) === str;
}

export async function getAppointments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doctorId = req.doctor!.doctorId;

    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

    if (startDate) {
      if (!isValidISODate(startDate)) {
        res.status(400).json({ error: "El formato de fecha debe ser YYYY-MM-DD" });
        return;
      }
    }

    if (endDate) {
      if (!isValidISODate(endDate)) {
        res.status(400).json({ error: "El formato de fecha debe ser YYYY-MM-DD" });
        return;
      }
    }

    if (startDate && endDate && startDate > endDate) {
      res.status(400).json({ error: "La fecha final debe ser posterior a la fecha inicial" });
      return;
    }

    const appointments = await appointmentService.getDoctorAppointments(doctorId, { startDate, endDate });
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

export async function createConfirmedAppointment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doctorId = req.doctor!.doctorId;
    const { timeSlotId, patientName, patientEmail, patientPhone, patientDni } = createConfirmedAppointmentSchema.parse(req.body);

    const appointment = await appointmentService.createConfirmedAppointment({
      doctorId,
      timeSlotId,
      patientName,
      patientEmail,
      patientPhone,
      patientDni,
    });

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
}

export async function updateAppointmentPatient(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doctorId = req.doctor!.doctorId;
    const appointmentId = req.params.id as string;
    const data = updateAppointmentPatientSchema.parse(req.body);

    // Verify the appointment belongs to this doctor
    const appointments = await appointmentService.getDoctorAppointments(doctorId);
    const appointment = appointments.find(a => a.id === appointmentId);

    if (!appointment) {
      res.status(404).json({ error: "Turno no encontrado o no pertenece a este médico" });
      return;
    }

    const updated = await appointmentService.updateAppointmentPatient(appointmentId, data);
    res.json(updated);
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
