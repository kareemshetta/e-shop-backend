import joi from "joi";

import { generalFields } from "../../middleware/validation.js";

export const createOrderSchema = joi
  .object({
    address: joi.string().min(3).max(30).required(),
    phone: joi
      .array()
      .items(joi.string().pattern(new RegExp(/^(022|\+2)?(01)[0125][0-9]{8}$/)))
      .min(1)
      .max(3)
      .required(),
    paymentType: joi.string().valid("card", "cash"),
    couponCode: joi.string().length(4),
    products: joi.array().items(
      joi.object({
        productId: generalFields.id.required(),
        quantity: joi.number().integer().positive().min(1).required(),
      })
    ),
  })
  .required();

// export const updateCategorySchema = joi
//   .object({
//     categoryId: generalFields.id.required(),
//     name: joi.string().min(3).max(30),
//     file: generalFields.file,
//   })
//   .required();

export const cancelOrderSchema = joi
  .object({
    orderId: generalFields.id.required(),
    reason: joi.string().min(3).max(30),
  })
  .required();
export const updateOrderStatusSchema = joi.object({
  orderId: generalFields.id.required(),
  status: joi.string().valid("rejected", "canceled", "onway", "delivered"),
});
