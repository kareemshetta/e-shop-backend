import { Router } from "express";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import auth from "../../middleware/auth.js";
import * as productController from "./controller/product.js";
import * as productValidator from "./product.validation.js";
import { validation } from "../../middleware/validation.js";
import multer from "multer";
// const upload = multer({ storage: multer.diskStorage({}) });
const upload = multer({
  // fileFilter,
  storage: multer.diskStorage({}),
  limits: { fileSize: 1024 * 1024 * 50 },
});

const router = Router();

// router.get("/", productController.getAllProduct);
router.post(
  "/",
  auth("User", "Admin"),
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImage", maxCount: 6 },
  ]),
  validation(productValidator.createProductSchema),
  productController.createProduct
);
router.patch(
  "/:productId",
  fileUpload(fileValidation.image).fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImage", maxCount: 6 },
  ]),
  validation(productValidator.updateProductSchema),
  productController.updateProduct
);
export default router;
