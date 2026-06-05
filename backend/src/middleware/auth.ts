import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  doctor?: TokenPayload;
}

export function verifyTokenMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.doctor = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token invalido o expirado" });
  }
}

export function requireRole(role: "ADMIN" | "DOCTOR") {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.doctor) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }
    if (role === "ADMIN" && req.doctor.role !== "ADMIN") {
      res.status(403).json({ error: "Se requiere acceso de administrador" });
      return;
    }
    next();
  };
}
