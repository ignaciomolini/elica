import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as specialtyService from "../services/specialtyService.js";
import * as doctorService from "../services/doctorService.js";
import * as appointmentService from "../services/appointmentService.js";

const cancelSchema = z.object({
  status: z.literal("CANCELLED"),
});

const rescheduleSchema = z.object({
  timeSlotId: z.string().min(1, "El ID del nuevo horario es requerido"),
});

const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, "El ID del médico es requerido"),
  timeSlotId: z.string().min(1, "El ID del horario es requerido"),
  patientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  patientEmail: z.string().email("Formato de correo inválido"),
  patientPhone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
  patientDni: z.string().min(7, "El DNI debe tener al menos 7 caracteres").max(10),
});

// Specialties
export async function getSpecialties(_req: Request, res: Response, next: NextFunction) {
  try {
    const specialties = await specialtyService.getAllSpecialties();
    res.json(specialties);
  } catch (err) {
    next(err);
  }
}

export async function createSpecialty(req: Request, res: Response, next: NextFunction) {
  try {
    const specialty = await specialtyService.createSpecialty(req.body);
    res.status(201).json(specialty);
  } catch (err) {
    next(err);
  }
}

export async function updateSpecialty(req: Request, res: Response, next: NextFunction) {
  try {
    const specialty = await specialtyService.updateSpecialty(req.params.id as string, req.body);
    res.json(specialty);
  } catch (err) {
    next(err);
  }
}

export async function deleteSpecialty(req: Request, res: Response, next: NextFunction) {
  try {
    await specialtyService.deleteSpecialty(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Doctors
export async function getDoctors(_req: Request, res: Response, next: NextFunction) {
  try {
    const doctors = await doctorService.getDoctors();
    res.json(doctors);
  } catch (err) {
    next(err);
  }
}

export async function createDoctor(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body;
    // Default avatar with initials if not provided
    if (!data.avatar && data.name) {
      data.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff&size=200`;
    }
    const doctor = await doctorService.createDoctor(data);
    res.status(201).json(doctor);
  } catch (err) {
    next(err);
  }
}

export async function updateDoctor(req: Request, res: Response, next: NextFunction) {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id as string, req.body);
    res.json(doctor);
  } catch (err) {
    next(err);
  }
}

export async function deleteDoctor(req: Request, res: Response, next: NextFunction) {
  try {
    await doctorService.deleteDoctor(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Appointments
export async function getAppointments(_req: Request, res: Response, next: NextFunction) {
  try {
    const appointments = await appointmentService.getAllAppointments();
    res.json(appointments);
  } catch (err) {
    next(err);
  }
}

export async function deleteAppointment(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const result = await appointmentService.deleteAppointment(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function cancelAppointment(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    cancelSchema.parse(req.body);
    const result = await appointmentService.updateAppointmentStatus(id, "CANCELLED" as any);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function rescheduleAppointment(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { timeSlotId } = rescheduleSchema.parse(req.body);
    const result = await appointmentService.adminRescheduleAppointment(id, timeSlotId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createAppointment(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createAppointmentSchema.parse(req.body);
    const result = await appointmentService.createConfirmedAppointment(input);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// Stats
export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const [totalDoctors, totalSpecialties, totalAppointments, pendingAppointments] = await Promise.all([
      doctorService.countDoctors(),
      specialtyService.countSpecialties(),
      appointmentService.countAppointments(),
      appointmentService.countAppointmentsByStatus('PENDING')
    ]);
    
    res.json({
      totalDoctors,
      totalSpecialties,
      totalAppointments,
      pendingAppointments
    });
  } catch (err) {
    next(err);
  }
}
