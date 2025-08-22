import { Router } from "express";
import {
  uploadMaterial,
  getStudyMaterialDetails,
  listUserStudyMaterials,
  deleteStudyMaterial,
} from "../controllers/studyMaterial.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js"; // Import Multer

const router = Router();
router.use(verifyJwt); // Secure all routes in this file

// This route now uses Multer to handle a single file upload
// The field name in the form-data must be "document"
router.route("/upload").post(upload.single("document"), uploadMaterial);

router.route("/").get(listUserStudyMaterials);

router
  .route("/:materialId")
  .get(getStudyMaterialDetails)
  .delete(deleteStudyMaterial);

export default router;
