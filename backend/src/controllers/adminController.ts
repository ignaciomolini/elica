import { Request, Response, NextFunction } from "express";
import * as specialtyService from "../services/specialtyService.js";
import * as doctorService from "../services/doctorService.js";
import * as appointmentService from "../services/appointmentService.js";

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
    const doctor = await doctorService.createDoctor(req.body);
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

// Stats
export async function deleteAppointment(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const result = await appointmentService.deleteAppointment(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

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
