import cloudinary from "../../../utils/cloudinary.js";
import BrandModel from "../../../../DB/model/Brand.model.js";

import { asyncHandler } from "../../../utils/errorHandling.js";
export const createBrand = asyncHandler(async (request, response, next) => {
  console.log(request.body, request.file);

  const { name } = request.body;
  if (await BrandModel.findOne({ name })) {
    // return next(new Error(`Category ${name} already exists`, { cause: 409 }));
    throw new Error(`brand ${name} already exists`, { cause: 409 });
  }
 
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      request.file.path,
      {
        folder: `${process.env.APP_NAME}/brand/}`,
      }
    );

    request.body.image = { secure_url, public_id };
  

  const brand = await BrandModel.create(request.body);
  if (brand) return response.status(201).json({ message: "done", brand });
});
// update ////////////////////////////////////////////////////
export const updateBrand = asyncHandler(async (request, response, next) => {
  console.log(request.body, request.file);
  const { brandId } = request.params;
  const { name } = request.body;
  const brand = await BrandModel.findOne({
    _id: brandId,
  });
  if (!brand) {
    throw new Error(` invalid brandId  `, { cause: 404 });
  }

  if (request.body.name) {
    if (brand.name === request.body.name) {
      throw new Error(`cannot update you have provided the same name  `, {
        cause: 409,
      });
    }
    if (await BrandModel.findOne({ name })) {
      throw new Error(`this brand name is already exists   `, {
        cause: 409,
      });
    }
    brand.name = name;
  }
 
  if (request.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      request.file.path,
      {
        folder: `${process.env.APP_NAME}/brand/`,
      }
    );
    if (brand.image) {
      await cloudinary.uploader.destroy(brand.image.public_id);
    }

    brand.image = { secure_url, public_id };
  }
  const updatedBrand = await brand.save();

  if (updatedBrand)
    return response.status(201).json({ message: "done", updatedBrand });
});

export const getAllBrand = asyncHandler(async (request, response, next) => {
  const brands = await BrandModel.find();
  if (!brands) throw new Error("there're no  brands", { cause: 404 });
  brands && response.status(200).json({ message: "success", brands });
});
