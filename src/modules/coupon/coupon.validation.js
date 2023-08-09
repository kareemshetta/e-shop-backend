import joi from "joi";

import { generalFields } from "../../middleware/validation.js";

export const createCouponSchema = joi
  .object({
    code: joi.string().min(3).max(30).required(),
    // createdBy: generalFields.id.r,
    discount: joi.number().positive().min(1).max(100).required(),
    expireDate: joi.date().greater(Date.now()).required(),
    file: generalFields.file,
  })
  .required();

export const updateCouponSchema = joi
  .object({
    code: joi.string().min(3).max(30),
    createdBy: generalFields.id,
    discount: joi.number().positive().min(1).max(100),
    expireData: joi.date(),
    file: generalFields.file,
  })
  .required();
