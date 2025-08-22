import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { StudyMaterial } from "../models/studyMaterial.models.js";
import pdf from "pdf-parse/lib/pdf-parse.js";
import fs from "fs";
import Tesseract from "tesseract.js";

const uploadMaterial = asyncHandler(async (req, res) => {
  const { language } = req.body;
  const user = req.user._id;

  const localFilePath = req.file?.path;
  if (!localFilePath) {
    throw new ApiError(400, "A file is required.");
  }

  let extractedText = "";

  try {
    // --- Smart PDF Processing ---
    console.log("Processing PDF file...");
    const dataBuffer = fs.readFileSync(localFilePath);
    const data = await pdf(dataBuffer);
    extractedText = data.text;

    // --- OCR Fallback Logic ---
    // If pdf-parse returns very little or no text, it's likely a scanned/image-based PDF.
    if (!extractedText || extractedText.trim().length < 100) {
      // Check for a meaningful amount of text
      console.log(
        "PDF contains little or no text. Attempting OCR with Tesseract..."
      );

      // Tesseract works directly with the file path
      const result = await Tesseract.recognize(localFilePath, "eng", {
        logger: (m) => console.log(m), // This will show OCR progress in your console
      });
      extractedText = result.data.text;
    }
    // --- End of OCR Fallback Logic ---

    if (!extractedText) {
      throw new ApiError(
        500,
        "Could not extract any text from the document, even after OCR."
      );
    }

    const studyMaterial = await StudyMaterial.create({
      user,
      fileName: req.file.originalname,
      extractedText: extractedText,
      language,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, studyMaterial, "Material processed successfully")
      );
  } catch (error) {
    console.error("Error during file processing:", error);
    throw new ApiError(500, `Failed to process file: ${error.message}`);
  } finally {
    // Clean up the temporary file from the server
    if (localFilePath) {
      fs.unlinkSync(localFilePath);
    }
  }
});

// --- Other controller functions remain the same ---

const getStudyMaterialDetails = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const material = await StudyMaterial.findById(materialId);

  if (!material) {
    throw new ApiError(404, "Study material not found");
  }

  if (material.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to view this material");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, material, "Material details fetched successfully")
    );
});

const listUserStudyMaterials = asyncHandler(async (req, res) => {
  const materials = await StudyMaterial.find({ user: req.user._id });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        materials,
        "User's study materials fetched successfully"
      )
    );
});

const deleteStudyMaterial = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const material = await StudyMaterial.findById(materialId);

  if (!material) {
    throw new ApiError(404, "Study material not found");
  }

  if (material.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this material");
  }

  await StudyMaterial.findByIdAndDelete(materialId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Material deleted successfully"));
});

export {
  uploadMaterial,
  getStudyMaterialDetails,
  listUserStudyMaterials,
  deleteStudyMaterial,
};
