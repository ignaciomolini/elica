import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import specialtyRoutes from "./routes/specialties.js";
import doctorRoutes from "./routes/doctors.js";
import appointmentRoutes from "./routes/appointments.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import doctorAuthRoutes from "./routes/doctor.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { verifyTokenMiddleware, requireRole } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Public routes
app.use("/api/specialties", specialtyRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);

// Admin routes (require ADMIN role)
app.use("/api/admin", verifyTokenMiddleware, requireRole("ADMIN"), adminRoutes);

// Doctor routes (require authentication)
app.use("/api/doctor", verifyTokenMiddleware, doctorAuthRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[ELICA] Server running on http://localhost:${PORT}`);
});

export default app;
