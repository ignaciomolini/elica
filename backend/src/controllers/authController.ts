import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as authService from "../services/authService.js";
import { getDoctorById } from "../services/doctorService.js";
import { AuthRequest } from "../middleware/auth.js";

const loginSchema = z.object({
  email: z.string({
    error: "El correo es requerido",
  }).email("Formato de correo inválido"),
  password: z.string({
    error: "La contraseña es requerida",
  }).min(1, "La contraseña es requerida"),
});

const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

function setTokenCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);

    setTokenCookie(res, result.token);

    // Return only doctor info (not token)
    res.json({ doctor: result.doctor });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token");
  res.json({ message: "Sesion cerrada" });
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.doctor) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const doctor = await getDoctorById(req.doctor.doctorId);
    res.json(doctor);
  } catch (err) {
    next(err);
  }
}
