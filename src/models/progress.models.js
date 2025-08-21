import mongoose, { Schema } from "mongoose";

const progressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizScores: [
      {
        quiz: {
          type: Schema.Types.ObjectId,
          ref: "Quiz",
        },
        score: {
          type: Number,
        },
        takenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    flashcardReviews: [
      {
        flashcardSet: {
          // Referring to the whole set
          type: Schema.Types.ObjectId,
          ref: "Flashcard",
        },
        reviewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    studyStreaks: {
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      lastStudyDay: {
        type: Date,
      },
    },
    knowledgeHeatmap: {
      type: Map,
      of: Number, // Maps a subject/topic string to a score
    },
  },
  { timestamps: true }
);

export const Progress = mongoose.model("Progress", progressSchema);
