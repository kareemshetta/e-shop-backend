import joi from "joi";

import { generalFields } from "../../middleware/validation.js";

export const createSubcategorySchema = joi
  .object({
    name: joi.string().min(3).max(30).required(),
    categoryId: generalFields.id.required(),
    // createdBy: generalFields.id.required(),
    file: generalFields.file.required(),
  })
  .required();

export const updateSubcategorySchema = joi.object({
  categoryId: generalFields.id.required(),
  subcategoryId: generalFields.id.required(),
  name: joi.string().min(3).max(30),
  file: generalFields.file,
  category: generalFields.id,
});
// .required();
