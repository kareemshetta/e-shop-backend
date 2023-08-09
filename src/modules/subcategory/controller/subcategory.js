import slugify from "slugify";
import { nanoid } from "nanoid";
import cloudinary from "../../../utils/cloudinary.js";
import SubcategoryModel from "../../../../DB/model/Subcategory.model.js";
import CategoryModel from "../../../../DB/model/category.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
export const createSubcategory = asyncHandler(
  async (request, response, next) => {
    const { categoryId } = request.params;
    const { name } = request.body;
    if (!(await CategoryModel.findById(categoryId))) {
      throw new Error(` this category doesn't exists check categoryId`, {
        cause: 404,
      });
    }
    
    if (await SubcategoryModel.findOne({ name })) {
      // return next(new Error(`Category ${name} already exists`, { cause: 409 }));
      throw new Error(`Subcategory ${name} already exists`, { cause: 409 });
    }
    const customId = nanoid();
    request.body.slug = slugify(name);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      request.file.path,
      {
        folder: `${process.env.APP_NAME}/category/${categoryId}/${customId}`,
      }
    );
    request.body.customId = customId;
    request.body.image = { secure_url, public_id };
    request.body.category = categoryId;
    request.body.createdBy = request.decoded._id;
    const subcategory = await SubcategoryModel.create(request.body);
    if (subcategory)
      return response.status(201).json({ message: "done", subcategory });
  }
);

export const updateSubcategory = asyncHandler(
  async (request, response, next) => {
    // console.log(request.body, request.file);
    const { categoryId, subcategoryId } = request.params;
    const { name } = request.body;
    const subcategory = await SubcategoryModel.findOne({
      _id: subcategoryId,
      category: categoryId,
    });
    if (!subcategory) {
      throw new Error(` invalid subcategoryId  `, { cause: 404 });
    }

    if (request.body.name) {
      if (subcategory.name === request.body.name) {
        throw new Error(`cannot update you have provided the same name  `, {
          cause: 409,
        });
      }
      if (await SubcategoryModel.findOne({ name })) {
        throw new Error(`this subcategory name is already exists   `, {
          cause: 409,
        });
      }
      subcategory.name = request.body.name;
      subcategory.slug = slugify(request.body.name);
    }

    if (request.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        request.file.path,
        {
          folder: `${process.env.APP_NAME}/category/${categoryId}/${subcategory.customId}`,
        }
      );
      await cloudinary.uploader.destroy(subcategory.image.public_id);
      subcategory.image = { secure_url, public_id };
    }
    const updatedSubcategory = await subcategory.save();

    if (updatedSubcategory)
      return response.status(201).json({ message: "done", updatedSubcategory });
  }
);

export const getAllSubcategory = asyncHandler(
  async (request, response, next) => {
    const subcategories = await SubcategoryModel.find();
    if (!subcategories) throw new ApiError("there're no  subcategories", 404);
    subcategories &&
      response.status(200).json({ message: "success", subcategories });
  }
);
