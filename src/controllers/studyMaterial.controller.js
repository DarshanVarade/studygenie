import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { StudyMaterial } from "../models/studyMaterial.models.js";
// In a real application, you would use a file upload service
// import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadMaterial = asyncHandler(async (req, res) => {
  const { fileName, language } = req.body;
  const user = req.user._id;

  if (!fileName) {
    throw new ApiError(400, "File name is required");
  }

  // --- Simulation of File Upload and Text Extraction ---
  // In a real application, you would handle the file from `req.file`
  // and upload it to a cloud service.
  // const localFilePath = req.file?.path;
  // if (!localFilePath) {
  //   throw new ApiError(400, "File is missing");
  // }
  // const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
  // if (!cloudinaryResponse) {
  //   throw new ApiError(500, "Failed to upload file to cloud storage");
  // }

  // For now, we will use placeholder data.
  const simulatedFileUrl = `https://example.com/uploads/${fileName.replace(
    /\s+/g,
    "-"
  )}`;
  const simulatedExtractedText =
    "This is the simulated extracted text from the uploaded PDF. In a real application, this text would be the result of an OCR or PDF parsing process. It contains all the key concepts for generating summaries, quizzes, and flashcards. For example, mitochondria is the powerhouse of the cell.";
  // --- End of Simulation ---

  const studyMaterial = await StudyMaterial.create({
    user,
    fileName,
    fileUrl: simulatedFileUrl, // Use cloudinaryResponse.url in a real app
    extractedText: simulatedExtractedText,
    language,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, studyMaterial, "Material uploaded successfully")
    );
});

const getStudyMaterialDetails = asyncHandler(async (req, res) => {
  const { materialId } = req.params;

  const material = await StudyMaterial.findById(materialId);

  if (!material) {
    throw new ApiError(404, "Study material not found");
  }

  // Ensure the user owns this material
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

  // Ensure the user owns this material before deleting
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
