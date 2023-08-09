import joi from "joi";

import { generalFields } from "../../middleware/validation.js";

export const createProductSchema = joi
  .object({
    name: joi.string().min(3).max(30).required(),
    category: generalFields.id.required(),
    subcategory: generalFields.id.required(),
    brand: generalFields.id.required(),
    description: joi.string().min(3).max(300).required(),
    // createdBy: generalFields.id.required(),
    file: joi
      .object({
        mainImage: joi
          .array()
          .length(1)
          .items(generalFields.file.required())
          .required(),
        subImage: joi.array().items(generalFields.file.required()),
      })
      .required(),
    sizes: joi.array().items(joi.string().required()),
    colors: joi.array().items(joi.string().required()),
    price: joi.number().required(),
    stock: joi.number().required(),
    discount: joi.number(),
    file: joi
      .object({
        subImage: joi.array().items(generalFields.file.required()).required(),
        mainImage: joi
          .array()
          .length(1)
          .items(generalFields.file.required())
          .required(),
      })
      .required(),
  })
  .required();

export const updateProductSchema = joi
  .object({
    productId: generalFields.id.required(),
    name: joi.string().min(3).max(30),
    category: generalFields.id,
    subcategory: generalFields.id,
    brand: generalFields.id,
    description: joi.string().min(3).max(300),
    // createdBy: generalFields.id.required(),
    file: joi
      .object({
        mainImage: joi.array().length(1).items(generalFields.file.required()),
        subImage: joi.array().items(generalFields.file.required()),
      })
      .required(),
    sizes: joi.array().items(joi.string().required()),
    colors: joi.array().items(joi.string().required()),
    price: joi.number(),
    stock: joi.number(),
    discount: joi.number(),
    file: joi
      .object({
        subImage: joi.array().items(generalFields.file.required()),
        mainImage: joi.array().length(1).items(generalFields.file.required()),
      })
      .required(),
  })
  .required();
