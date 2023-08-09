import { Router } from "express";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import * as couponController from "./controller/coupon.js";
import * as couponValidator from "./coupon.validation.js";
import { validation } from "../../middleware/validation.js";
import auth from "../../middleware/auth.js";
const router = Router({ mergeParams: true });

router.get("/", couponController.getAllCoupon);
router.post(
  "/",
  auth("User", "Admin"),
  fileUpload(fileValidation.image).single("image"),
  validation(couponValidator.createCouponSchema),
  couponController.createCoupon
);
router.patch(
  "/:CouponId",
  fileUpload(fileValidation.image).single("image"),
  validation(couponValidator.updateCouponSchema),
  couponController.updateCoupon
);
export default router;
