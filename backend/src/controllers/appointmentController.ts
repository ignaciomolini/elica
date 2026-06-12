import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as appointmentService from "../services/appointmentService.js";
import { AuthRequest } from "../middleware/auth.js";
import { AppointmentStatus } from "@prisma/client";

const createAppointmentSchema = z.object({
  doctorId: z.string({
    error: "El ID del médico es requerido",
  }).min(1, "El ID del médico es requerido"),
  timeSlotId: z.string({
    error: "El ID del horario es requerido",
  }).min(1, "El ID del horario es requerido"),
  patientName: z.string({
    error: "El nombre es requerido",
  }).min(2, "El nombre debe tener al menos 2 caracteres"),
  patientEmail: z.string({
    error: "El correo es requerido",
  }).email("Formato de correo inválido"),
  patientPhone: z.string({
    error: "El teléfono es requerido",
  }).min(8, "El teléfono debe tener al menos 8 caracteres"),
  patientDni: z.string({
    error: "El DNI es requerido",
  }).min(7, "El DNI debe tener al menos 7 caracteres")
   .max(10, "El DNI no puede tener más de 10 caracteres"),
});

const verifyAppointmentSchema = z.object({
  appointmentId: z.string({
    error: "El ID del turno es requerido",
  }).min(1, "El ID del turno es requerido"),
  code: z.string({
    error: "El código de verificación es requerido",
  }).length(6, "El código de verificación debe tener 6 dígitos"),
});

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"], {
    error: "El estado debe ser PENDING, CONFIRMED o CANCELLED",
  }),
});

const cancelAppointmentSchema = z.object({
  dni: z.string({
    error: "El DNI es requerido",
  }).min(7, "El DNI debe tener al menos 7 caracteres")
   .max(10, "El DNI no puede tener más de 10 caracteres"),
});

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createAppointmentSchema.parse(req.body);
    const appointment = await appointmentService.createAppointment(input);
    
    // Set verification token cookie (5 minutes expiration)
    res.cookie("verification_token", appointment.verificationToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 60 * 1000, // 5 minutes
    });
    
    // Don't send verification token in response body
    const { verificationToken, ...response } = appointment;
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function verify(req: Request, res: Response, next: NextFunction) {
  try {
    const { appointmentId, code } = verifyAppointmentSchema.parse(req.body);
    const appointment = await appointmentService.verifyAppointment(appointmentId, code);
    // Clear the verification cookie on successful verification
    res.clearCookie("verification_token");
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

export async function getByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const dni = req.query.dni as string;

    if (!dni) {
      res.status(400).json({ error: "El DNI es requerido como parámetro de consulta" });
      return;
    }

    const appointments = await appointmentService.getAppointmentsByPatient(dni);
    res.json(appointments);
  } catch (err) {
    next(err);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { dni } = cancelAppointmentSchema.parse(req.body);
    const appointment = await appointmentService.cancelAppointment(id, dni);
    // Clear the verification cookie when cancelling
    res.clearCookie("verification_token");
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

export async function getDoctorAppointments(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const doctorId = req.doctor!.doctorId;
    const appointments = await appointmentService.getDoctorAppointments(doctorId);
    res.json(appointments);
  } catch (err) {
    next(err);
  }
}

export async function getAllAppointments(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointments = await appointmentService.getAllAppointments();
    res.json(appointments);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
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

export async function getPending(req: Request, res: Response, next: NextFunction) {
  try {
    const { dni } = req.query;

    if (!dni) {
      res.status(400).json({ error: "DNI es requerido" });
      return;
    }

    const appointment = await appointmentService.getPendingAppointment(
      dni as string
    );

    if (!appointment) {
      res.json({ appointment: null });
      return;
    }

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
}

export async function resendCode(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { dni } = req.body;

    if (!dni) {
      res.status(400).json({ error: "DNI es requerido" });
      return;
    }

    await appointmentService.resendVerificationCode(id, dni);
    res.json({ message: "Código reenviado correctamente" });
  } catch (err) {
    next(err);
  }
}

const actionCodeSchema = z.object({
  dni: z.string().min(7, "El DNI debe tener al menos 7 caracteres"),
  code: z.string().length(6, "El código debe tener 6 dígitos"),
});

const rescheduleSchema = z.object({
  dni: z.string().min(7, "El DNI debe tener al menos 7 caracteres"),
  code: z.string().length(6, "El código debe tener 6 dígitos"),
  timeSlotId: z.string().min(1, "El ID del nuevo horario es requerido"),
});

export async function requestActionCode(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { dni } = cancelAppointmentSchema.parse(req.body);
    const result = await appointmentService.requestActionCode(id, dni);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function cancelWithCode(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { dni, code } = actionCodeSchema.parse(req.body);
    const appointment = await appointmentService.cancelWithCode(id, dni, code);
    res.clearCookie("verification_token");
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

export async function reschedule(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { dni, code, timeSlotId } = rescheduleSchema.parse(req.body);
    const appointment = await appointmentService.rescheduleAppointment(id, dni, code, timeSlotId);
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

export async function getPendingByToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.verification_token;

    if (!token) {
      res.json({ appointment: null });
      return;
    }

    const appointment = await appointmentService.getPendingAppointmentByToken(token);

    if (!appointment) {
      // Clear invalid/expired cookie
      res.clearCookie("verification_token");
      res.json({ appointment: null });
      return;
    }

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
}
