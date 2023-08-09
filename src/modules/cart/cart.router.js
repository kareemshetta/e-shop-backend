import { Router } from "express";

import * as cartController from "./controller/cart.js";
import * as cartValidator from "./cart.validation.js";
import { validation } from "../../middleware/validation.js";
import auth from "../../middleware/auth.js";
const router = Router();

router.post(
  "/",
  auth("User", "Admin"),

  validation(cartValidator.createCartSchema),
  cartController.createCart
);

// router.patch(
//   "/:subcategoryId",
//   fileUpload(fileValidation.image).single("image"),
//   validation(subcategoryValidator.updateSubcategorySchema),
//   subcategoryController.updateSubcategory
// );
export default router;
