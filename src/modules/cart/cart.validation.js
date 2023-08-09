import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const createCartSchema = joi.object({
  productId: generalFields.id.required(),
  quantity: joi.number().positive(),
});
