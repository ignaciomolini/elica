import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as specialtyService from "../services/specialtyService.js";

const createSpecialtySchema = z.object({
  name: z.string({
    error: "El nombre es requerido",
  }).min(1, "El nombre es requerido"),
  description: z.string({
    error: "La descripción es requerida",
  }).min(1, "La descripción es requerida"),
  icon: z.string({
    error: "El ícono es requerido",
  }).min(1, "El ícono es requerido"),
});

const updateSpecialtySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  description: z.string().min(1, "La descripción es requerida").optional(),
  icon: z.string().min(1, "El ícono es requerido").optional(),
});

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const specialties = await specialtyService.getAllSpecialties();
    res.json(specialties);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const specialty = await specialtyService.getSpecialtyById(req.params.id as string);
    res.json(specialty);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createSpecialtySchema.parse(req.body);
    const specialty = await specialtyService.createSpecialty(input);
    res.status(201).json(specialty);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateSpecialtySchema.parse(req.body);
    const specialty = await specialtyService.updateSpecialty(req.params.id as string, input);
    res.json(specialty);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await specialtyService.deleteSpecialty(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
