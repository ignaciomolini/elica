import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";

export async function uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No se seleccionó ninguna imagen" });
      return;
    }

    const url = `/uploads/avatars/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    next(err);
  }
}
