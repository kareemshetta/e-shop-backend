import { Router } from "express";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import * as categoryController from "./controller/category.js";
import * as categoryValidator from "./category.validation.js";
import { validation } from "../../middleware/validation.js";
import auth from "../../middleware/auth.js";
import subcategoryRouter from "../subcategory/subcategory.router.js";
const router = Router();
router.use("/:categoryId/subcategory", subcategoryRouter);
router.get("/", auth("Admin","User"), categoryController.getAllCategory);
router.post(
  "/",
  auth("Admin", "User"),
  fileUpload(fileValidation.image).single("image"),

  validation(categoryValidator.createCategorySchema),
  categoryController.createCategory
);
router.patch(
  "/:categoryId",
  fileUpload(fileValidation.image).single("image"),
  validation(categoryValidator.updateCategorySchema),
  categoryController.updateCategory
);
export default router;
