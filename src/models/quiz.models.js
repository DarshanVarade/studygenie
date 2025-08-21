import mongoose, { Schema } from "mongoose";

const quizSchema = new Schema(
  {
    studyMaterial: {
      type: Schema.Types.ObjectId,
      ref: "StudyMaterial",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },
        options: [
          {
            type: String,
            required: true,
          },
        ],
        correctAnswer: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Quiz = mongoose.model("Quiz", quizSchema);
