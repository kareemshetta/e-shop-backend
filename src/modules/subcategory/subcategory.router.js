import { Router } from "express";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import * as subcategoryController from "./controller/subcategory.js";
import * as subcategoryValidator from "./subcategory.validation.js";
import { validation } from "../../middleware/validation.js";
import auth from "../../middleware/auth.js";
const router = Router({ mergeParams: true });

router.get("/", subcategoryController.getAllSubcategory);
router.post(
  "/",
  auth("User"),
  fileUpload(fileValidation.image).single("image"),
  validation(subcategoryValidator.createSubcategorySchema),
  subcategoryController.createSubcategory
);
router.patch(
  "/:subcategoryId",
  fileUpload(fileValidation.image).single("image"),
  validation(subcategoryValidator.updateSubcategorySchema),
  subcategoryController.updateSubcategory
);
export default router;
