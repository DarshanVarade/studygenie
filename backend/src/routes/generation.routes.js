import { Router } from "express";
import {
  generateSummary,
  generateQuiz,
  generateFlashcards,
  translateContent,
} from "../controllers/generation.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJwt);

router.route("/:materialId/summary").post(generateSummary);
router.route("/:materialId/quiz").post(generateQuiz);
router.route("/:materialId/flashcards").post(generateFlashcards);
router.route("/translate").post(translateContent);

export default router;
