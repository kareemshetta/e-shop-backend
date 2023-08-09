import joi from "joi";

import { generalFields } from "../../middleware/validation.js";

export const createBrandSchema = joi
  .object({
    name: joi.string().min(3).max(30).required(),
    createdBy: generalFields.id,

    file: generalFields.file,
  })
  .required();

export const updateBrandSchema = joi
  .object({
    name: joi.string().min(3).max(30),
    createdBy: generalFields.id,

    file: generalFields.file,
  })
  .required();
