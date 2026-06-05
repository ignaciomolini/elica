import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as doctorService from "../services/doctorService.js";

const createDoctorSchema = z.object({
  name: z.string({
    error: "El nombre es requerido",
  }).min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string({
    error: "El correo es requerido",
  }).email("Formato de correo inválido"),
  password: z.string({
    error: "La contraseña es requerida",
  }).min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ADMIN", "DOCTOR"], {
    error: "El rol debe ser ADMIN o DOCTOR",
  }).optional(),
  avatar: z.string({
    error: "El avatar es requerido",
  }).min(1, "El avatar es requerido"),
  bio: z.string({
    error: "La biografía es requerida",
  }).min(1, "La biografía es requerida"),
  specialtyIds: z.array(z.string()).optional(),
});

const updateDoctorSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  email: z.string().email("Formato de correo inválido").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  role: z.enum(["ADMIN", "DOCTOR"], {
    error: "El rol debe ser ADMIN o DOCTOR",
  }).optional(),
  avatar: z.string().min(1, "El avatar es requerido").optional(),
  bio: z.string().min(1, "La biografía es requerida").optional(),
  specialtyIds: z.array(z.string()).optional(),
});

const createTimeSlotsSchema = z.object({
  date: z.string({
    error: "La fecha es requerida",
  }).min(1, "La fecha es requerida"),
  slots: z.array(z.object({ startTime: z.string(), endTime: z.string() })),
});

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const specialtyId = req.query.specialtyId as string | undefined;
    const doctors = await doctorService.getDoctors(specialtyId);
    res.json(doctors);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id as string);
    res.json(doctor);
  } catch (err) {
    next(err);
  }
}

export async function getSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const date = req.query.date as string;

    if (!date) {
      res.status(400).json({ error: "La fecha es requerida como parámetro de consulta" });
      return;
    }

    const slots = await doctorService.getDoctorSlots(id, date);
    res.json(slots);
  } catch (err) {
    next(err);
  }
}

export async function createSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { date, slots } = createTimeSlotsSchema.parse(req.body);
    const created = await doctorService.createTimeSlots(id, date, slots);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function deleteSlot(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const slotId = req.params.slotId as string;
    await doctorService.deleteTimeSlot(slotId, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createDoctorSchema.parse(req.body);
    const doctor = await doctorService.createDoctor(input);
    res.status(201).json(doctor);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateDoctorSchema.parse(req.body);
    const doctor = await doctorService.updateDoctor(req.params.id as string, input);
    res.json(doctor);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await doctorService.deleteDoctor(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
