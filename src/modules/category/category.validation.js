import joi from "joi";

import { generalFields } from "../../middleware/validation.js";

export const createCategorySchema = joi
  .object({
    name: joi.string().min(3).max(30).required(),
    // createdBy: generalFields.id.required(),
    file: generalFields.file.required(),
  })
  .required();

export const updateCategorySchema = joi
  .object({
    categoryId: generalFields.id.required(),
    name: joi.string().min(3).max(30),
    // createdBy: generalFields.id,
    file: generalFields.file,
  })
  .required();
