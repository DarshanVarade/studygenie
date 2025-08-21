import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { StudyMaterial } from "../models/studyMaterial.models.js";
import { Quiz } from "../models/quiz.models.js";
import { Flashcard } from "../models/flashcard.models.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generateSummary = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const material = await StudyMaterial.findById(materialId);

  if (!material || !material.extractedText) {
    throw new ApiError(404, "Study material or its text content not found");
  }

  const prompt = `Based on the following text, provide a concise, easy-to-understand summary. Focus on the key concepts and main points. Text: """${material.extractedText}"""`;

  const result = await model.generateContent(prompt);
  const summary = await result.response.text();

  return res
    .status(200)
    .json(new ApiResponse(200, { summary }, "Summary generated successfully"));
});

const generateQuiz = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const material = await StudyMaterial.findById(materialId);

  if (!material || !material.extractedText) {
    throw new ApiError(404, "Study material or its text content not found");
  }

  const prompt = `
    Create a 10-question multiple-choice quiz from the text below.
    For each question, provide 4 options.
    You MUST return the response as a single, valid JSON array of objects. Do not include any text outside of the JSON array.
    Each object in the array must have these exact keys: "questionText", "options" (which is an array of 4 strings), and "correctAnswer" (which is one of the strings from the options array).
    
    Text: """
    ${material.extractedText}
    """
  `;

  const result = await model.generateContent(prompt);
  const responseText = await result.response.text();

  let quizData;
  try {
    // Clean the response to ensure it's valid JSON
    const cleanedJsonString = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    quizData = JSON.parse(cleanedJsonString);
  } catch (error) {
    console.error("Failed to parse AI response as JSON:", responseText);
    throw new ApiError(
      500,
      "AI failed to generate a valid quiz. Please try again."
    );
  }

  const quiz = await Quiz.create({
    studyMaterial: materialId,
    title: `Quiz for ${material.fileName}`,
    questions: quizData,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, quiz, "Quiz generated successfully"));
});

const generateFlashcards = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const material = await StudyMaterial.findById(materialId);

  if (!material || !material.extractedText) {
    throw new ApiError(404, "Study material or its text content not found");
  }

  const prompt = `
    Generate 15 flashcards from the text below. A flashcard consists of a term or question on the front and a definition or answer on the back.
    You MUST return the response as a single, valid JSON array of objects. Do not include any text outside of the JSON array.
    Each object in the array must have these exact keys: "front" and "back".

    Text: """
    ${material.extractedText}
    """
  `;

  const result = await model.generateContent(prompt);
  const responseText = await result.response.text();

  let flashcardsData;
  try {
    // Clean the response to ensure it's valid JSON
    const cleanedJsonString = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    flashcardsData = JSON.parse(cleanedJsonString);
  } catch (error) {
    console.error("Failed to parse AI response as JSON:", responseText);
    throw new ApiError(
      500,
      "AI failed to generate valid flashcards. Please try again."
    );
  }

  const flashcardSet = await Flashcard.create({
    studyMaterial: materialId,
    flashcards: flashcardsData,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, flashcardSet, "Flashcards generated successfully")
    );
});

const translateContent = asyncHandler(async (req, res) => {
  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    throw new ApiError(400, "Text and target language are required.");
  }

  const prompt = `Translate the following text to ${targetLanguage}. Provide only the translated text in your response. Text: """${text}"""`;

  const result = await model.generateContent(prompt);
  const translatedText = await result.response.text();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { translatedText },
        "Content translated successfully"
      )
    );
});

export { generateSummary, generateQuiz, generateFlashcards, translateContent };
