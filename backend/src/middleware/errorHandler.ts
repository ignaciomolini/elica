import { Request, Response, NextFunction } from "express";
import { z } from "zod";

interface PrismaError extends Error {
  code?: string;
  meta?: { target?: string[] };
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[ERROR] ${err.message}`);

  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: "Datos inválidos",
      details: err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  if (err.name === "ZodError") {
    res.status(400).json({
      error: "Datos inválidos",
      details: err,
    });
    return;
  }

  // Prisma unique constraint violation (P2002)
  const prismaErr = err as PrismaError;
  if (prismaErr.code === "P2002") {
    const target = prismaErr.meta?.target?.join(", ") ?? "";
    if (target.includes("email")) {
      res.status(409).json({ error: "El correo ya está registrado" });
      return;
    }
    if (target.includes("name")) {
      res.status(409).json({ error: "El nombre de la especialidad ya existe" });
      return;
    }
    res.status(409).json({ error: "El registro ya existe" });
    return;
  }

  if (err.message.includes("no encontrado") || err.message.includes("No encontrado")) {
    res.status(404).json({ error: err.message });
    return;
  }

  if (err.message.includes("ya existe") || err.message.includes("Already exists") || err.message.includes("Unique constraint")) {
    res.status(409).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "Error interno del servidor" });
}
