import { Router } from "express";
import {
  uploadMaterial,
  getStudyMaterialDetails,
  listUserStudyMaterials,
  deleteStudyMaterial,
} from "../controllers/studyMaterial.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
// In a real app with file uploads, you'd use middleware like Multer here

const router = Router();
router.use(verifyJwt); // Apply JWT verification to all routes in this file

router.route("/").post(uploadMaterial).get(listUserStudyMaterials);

router
  .route("/:materialId")
  .get(getStudyMaterialDetails)
  .delete(deleteStudyMaterial);

export default router;
