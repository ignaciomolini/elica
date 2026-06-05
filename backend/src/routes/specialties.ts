import { Router } from "express";
import * as specialtyController from "../controllers/specialtyController.js";

const router = Router();

router.get("/", specialtyController.getAll);
router.get("/:id", specialtyController.getById);

export default router;
