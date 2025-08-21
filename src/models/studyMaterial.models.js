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
    fileUrl: {
      type: String, // URL from a service like Cloudinary or AWS S3
      required: true,
    },
    extractedText: {
      type: String,
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
