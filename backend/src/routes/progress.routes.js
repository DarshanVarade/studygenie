import { Router } from "express";
import {
  logQuizResult,
  updateStudyStreak,
  getUserDashboard,
} from "../controllers/progress.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJwt);

router.route("/log-quiz").post(logQuizResult);
router.route("/update-streak").post(updateStudyStreak);
router.route("/dashboard").get(getUserDashboard);

export default router;
