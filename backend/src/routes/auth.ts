import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { verifyTokenMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", verifyTokenMiddleware, authController.me);

export default router;
