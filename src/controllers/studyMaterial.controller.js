import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { StudyMaterial } from "../models/studyMaterial.models.js";
import pdf from "pdf-parse/lib/pdf-parse.js";
import fs from "fs";
import Tesseract from "tesseract.js";
import { fromPath } from "pdf2pic";
import path from "path";

const uploadMaterial = asyncHandler(async (req, res) => {
  const { language } = req.body;
  const user = req.user._id;

  const localFilePath = req.file?.path;
  if (!localFilePath) {
    throw new ApiError(400, "A file is required.");
  }

  let extractedText = "";
  // Define a temporary directory for image conversion
  const tempImageDir = path.join("public", "temp", "images");
  if (!fs.existsSync(tempImageDir)) {
    fs.mkdirSync(tempImageDir, { recursive: true });
  }

  try {
    console.log("Processing PDF file...");
    const dataBuffer = fs.readFileSync(localFilePath);
    const data = await pdf(dataBuffer);
    extractedText = data.text;

    // If the PDF has very little text, assume it's a scanned document and perform OCR
    if (!extractedText || extractedText.trim().length < 100) {
      console.log("PDF contains little text. Attempting OCR with Tesseract...");

      // --- PDF to Image Conversion Logic using pdf2pic ---
      const options = {
        density: 300, // DPI for better image quality
        savePath: tempImageDir,
        saveFilename: `page_${Date.now()}`,
        format: "png",
      };
      const convert = fromPath(localFilePath, options);
      const resolvedImages = await convert.bulk(-1, { responseType: "image" }); // -1 converts all pages

      if (!resolvedImages || resolvedImages.length === 0) {
        throw new Error("Could not convert PDF to images for OCR.");
      }
      // --- End of Conversion Logic ---

      let ocrText = "";
      for (const image of resolvedImages) {
        console.log(`Performing OCR on ${image.name}...`);
        const result = await Tesseract.recognize(image.path, "eng", {
          logger: (m) => console.log(m.status, m.progress),
        });
        ocrText += result.data.text + "\n";
        // Clean up the generated image file immediately after processing
        fs.unlinkSync(image.path);
      }
      extractedText = ocrText;
    }

    if (!extractedText) {
      throw new ApiError(500, "Could not extract any text from the document.");
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
    // Clean up the original temporary PDF file from the server
    if (fs.existsSync(localFilePath)) {
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
