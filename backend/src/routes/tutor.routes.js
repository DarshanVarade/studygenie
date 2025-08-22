import { Router } from "express";
import { askQuestion } from "../controllers/tutor.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJwt);

router.route("/:materialId/ask").post(askQuestion);

export default router;
