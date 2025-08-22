import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { StudyMaterial } from "../models/studyMaterial.models.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const askQuestion = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const { question } = req.body;

  if (!question) {
    throw new ApiError(400, "A question is required.");
  }

  const material = await StudyMaterial.findById(materialId);
  if (!material || !material.extractedText) {
    throw new ApiError(404, "Study material or its text content not found");
  }

  // This prompt is the core of the RAG system.
  const prompt = `
    You are an expert tutor. Answer the following question based ONLY on the provided context document.
    Do not use any external knowledge. If the answer cannot be found in the context, clearly state that the information is not available in the provided material.
    Explain the answer in a simple and easy-to-understand way.

    Context Document: """
    ${material.extractedText}
    """

    Question: "${question}"
  `;

  const result = await model.generateContent(prompt);
  const answer = await result.response.text();

  return res
    .status(200)
    .json(new ApiResponse(200, { answer }, "Tutor answered successfully"));
});

export { askQuestion };
