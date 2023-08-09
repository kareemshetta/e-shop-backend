import { Router } from "express";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import * as brandController from "./controller/Brand.js";
import * as brandValidator from "./brand.validation.js";
import { validation } from "../../middleware/validation.js";

const router = Router({ mergeParams: true });

router.get("/", brandController.getAllBrand);
router.post(
  "/",
  fileUpload(fileValidation.image).single("image"),
  validation(brandValidator.createBrandSchema),
  brandController.createBrand
);
router.patch(
  "/:brandId",
  fileUpload(fileValidation.image).single("image"),
  validation(brandValidator.updateBrandSchema),
  brandController.updateBrand
);
export default router;
