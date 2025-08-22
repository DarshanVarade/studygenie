import mongoose, { Schema } from "mongoose";

const studyMaterialSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    // This field is no longer essential but can be kept for future use
    fileUrl: {
      type: String,
    },
    // The extracted text is now the most important piece of data
    extractedText: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ["english", "hindi", "marathi"],
      default: "english",
    },
  },
  { timestamps: true }
);

export const StudyMaterial = mongoose.model(
  "StudyMaterial",
  studyMaterialSchema
);
