import mongoose, { Schema } from "mongoose";

const flashcardSchema = new Schema(
  {
    studyMaterial: {
      type: Schema.Types.ObjectId,
      ref: "StudyMaterial",
      required: true,
    },
    flashcards: [
      {
        front: {
          type: String,
          required: true,
        },
        back: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Flashcard = mongoose.model("Flashcard", flashcardSchema);
