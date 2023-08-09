import { Router } from "express";
import auth from "../../middleware/auth.js";
import * as orderValidator from "./order.validation.js";
import { validation } from "../../middleware/validation.js";
import * as orderController from "./controller/order.js";
const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "order Module" });
});

router.post(
  "/",
  auth("User", "Admin"),
  validation(orderValidator.createOrderSchema),
  orderController.createOrder
);
router.patch(
  "/:orderId",
  auth("User", "Admin"),
  validation(orderValidator.cancelOrderSchema),
  orderController.cancelOrder
);
router.patch(
  "/:orderId/status",
  auth("Admin"),
  validation(orderValidator.updateOrderStatusSchema),
  orderController.updateOrderStatusByAdmin
);
export default router;
