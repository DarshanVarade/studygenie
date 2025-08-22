import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Progress } from "../models/progress.models.js";
import { Quiz } from "../models/quiz.models.js";
import { StudyMaterial } from "../models/studyMaterial.models.js";

const logQuizResult = asyncHandler(async (req, res) => {
  const { quizId, score } = req.body;
  const userId = req.user._id;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  // Find the user's progress document, or create it if it doesn't exist
  let progress = await Progress.findOne({ user: userId });
  if (!progress) {
    progress = await Progress.create({ user: userId });
  }

  // Add the new quiz score
  progress.quizScores.push({ quiz: quizId, score });

  // --- Logic for Knowledge Heatmap ---
  // We need to associate this quiz with a topic. For simplicity,
  // we'll use the filename of the source material as the topic.
  const material = await StudyMaterial.findById(quiz.studyMaterial);
  if (material) {
    const topic = material.fileName.split(".")[0]; // e.g., "Physics Chapter 5"
    // If the topic already exists, you might want to average the scores
    // or just store the latest one. We'll store the latest score.
    progress.knowledgeHeatmap.set(topic, score);
  }
  // --- End of Heatmap Logic ---

  await progress.save();

  return res
    .status(200)
    .json(new ApiResponse(200, progress, "Quiz result logged successfully"));
});

const updateStudyStreak = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let progress = await Progress.findOne({ user: userId });
  if (!progress) {
    progress = await Progress.create({ user: userId });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to the start of the day

  const lastStudy = progress.studyStreaks.lastStudyDay;
  let currentStreak = progress.studyStreaks.currentStreak || 0;

  if (lastStudy) {
    const lastStudyDay = new Date(lastStudy);
    lastStudyDay.setHours(0, 0, 0, 0);

    const diffTime = today - lastStudyDay;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      // Studied yesterday, so increment the streak
      currentStreak++;
    } else if (diffDays > 1) {
      // Missed a day, so reset the streak to 1
      currentStreak = 1;
    }
    // If diffDays is 0, they already studied today, so do nothing.
  } else {
    // First time studying
    currentStreak = 1;
  }

  progress.studyStreaks.currentStreak = currentStreak;
  progress.studyStreaks.lastStudyDay = today;
  if (currentStreak > progress.studyStreaks.longestStreak) {
    progress.studyStreaks.longestStreak = currentStreak;
  }

  await progress.save();

  return res
    .status(200)
    .json(new ApiResponse(200, progress.studyStreaks, "Study streak updated"));
});

const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const progress = await Progress.findOne({ user: userId }).populate({
    path: "quizScores.quiz",
    select: "title", // Only populate the title of the quiz
  });

  if (!progress) {
    // If user has no progress, return a default empty state
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          quizScores: [],
          studyStreaks: { currentStreak: 0, longestStreak: 0 },
          knowledgeHeatmap: {},
        },
        "No progress found for user. Returning default dashboard."
      )
    );
  }

  // Convert map to object for easier consumption on the frontend
  const knowledgeHeatmap = Object.fromEntries(progress.knowledgeHeatmap);

  const dashboardData = {
    quizScores: progress.quizScores,
    studyStreaks: progress.studyStreaks,
    knowledgeHeatmap,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, dashboardData, "Dashboard data fetched successfully")
    );
});

export { logQuizResult, updateStudyStreak, getUserDashboard };
