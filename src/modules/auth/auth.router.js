import { Router } from "express";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import * as authController from "./controller/registration.js";
import * as authValidator from "./auth.validation.js";
import { validation } from "../../middleware/validation.js";
import auth from "../../middleware/auth.js";

const router = Router();

router.post(
  "/signup",
  validation(authValidator.signUpSchema),
  authController.signUp
);
router.get(
  "/confirmEmail/:token",
  validation(authValidator.tokenSchema),
  authController.confirmEmail
);
router.get(
  "/newConfirmEmail/:token",
  validation(authValidator.tokenSchema),
  authController.requestNewConfirmEmail
);

router.post(
  "/signin",
  validation(authValidator.signInSchema),
  authController.signIn
);

router.post(
  "/sendcode",
  validation(authValidator.sendVerificationCodeSchema),
  authController.sendVerificationCode
);

router.post(
  "/forgetpassword",
  validation(authValidator.forgetPasswordSchema),
  authController.forgetPassword
);

router.patch(
  "/changepassword",
  auth("User", "Admin"),
  validation(authValidator.changePasswordSchema),
  authController.changePassword
);
export default router;
