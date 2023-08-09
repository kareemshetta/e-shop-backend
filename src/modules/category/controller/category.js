import slugify from "slugify";
import cloudinary from "../../../utils/cloudinary.js";
import CategoryModel from "../../../../DB/model/category.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
export const createCategory = asyncHandler(async (request, response, next) => {
  // console.log(request.body, request.file);
  const { name } = request.body;
  if (await CategoryModel.findOne({ name })) {
    // return next(new Error(`Category ${name} already exists`, { cause: 409 }));
    throw new Error(`Category ${name} already exists`, { cause: 409 });
  }

  request.body.slug = slugify(name);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    request.file.path,
    {
      folder: `${process.env.APP_NAME}/category`,
    }
  );

  request.body.image = { secure_url, public_id };
  console.log("decoded", request.decoded);
  request.body.createdBy = request.decoded._id;
  const category = await CategoryModel.create(request.body);
  if (category) return response.status(201).json({ message: "done", category });
});

export const updateCategory = asyncHandler(async (request, response, next) => {
  console.log(request.body, request.params, request.file);
  const { name } = request.body;
  const category = await CategoryModel.findById(request.params.categoryId);
  if (!category) {
    throw new Error(` invalid CategoryId  `, { cause: 404 });
  }

  if (request.body.name) {
    if (category.name === request.body.name) {
      throw new Error(`cannot update you have provided the same name  `, {
        cause: 409,
      });
    }
    if (await CategoryModel.findOne({ name })) {
      throw new Error(`this category name is already exists   `, {
        cause: 409,
      });
    }
    category.slug = slugify(request.body.name);
    category.name = request.body.name;
  }

  if (request.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      request.file.path,
      {
        folder: `${process.env.APP_NAME}/category`,
      }
    );
    await cloudinary.uploader.destroy(category.image.public_id);
    category.image = { secure_url, public_id };
  }
  const updatedCategory = await category.save();

  if (updatedCategory)
    return response.status(201).json({ message: "done", updatedCategory });
});

export const getAllCategory = asyncHandler(async (request, response, next) => {
  const categories = await CategoryModel.find().populate("subcategory");

  if (!categories) throw new ApiError("there're no  categories", 404);
  categories && response.status(200).json({ message: "success", categories });
});
