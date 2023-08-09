import slugify from "slugify";
import { nanoid } from "nanoid";
import cloudinary from "../../../utils/cloudinary.js";
import BrandModel from "../../../../DB/model/Brand.model.js";
import SubcategoryModel from "../../../../DB/model/Subcategory.model.js";
import ProductModel from "../../../../DB/model/Product.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";

export const updateProduct = asyncHandler(async (request, response, next) => {
  const { category, subcategory, name, brand, price, discount } = request.body;
  const { productId } = request.params;
  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new Error(` Invalid ProductId  `, {
      cause: 404,
    });
  }
  if (
    !(await SubcategoryModel.findOne({ _id: subcategory, category: category }))
  ) {
    throw new Error(` Invalid category or subcategory `, {
      cause: 404,
    });
  }

  if (!(await BrandModel.findById(brand))) {
    throw new Error(` Invalid brandId `, {
      cause: 404,
    });
  }

  if (name) {
    request.slug = slugify(name, { lower: true, trim: true });
  }

  if (price && discount) {
    request.body.finalPrice = price - price * (discount / 100);
  } else if (price) {
    request.body.finalPrice = price - price * (product.discount / 100);
  } else if (discount) {
    console.log(discount);
    console.log(product.price - product.price * (discount / 100));
    request.body.finalPrice = product.price - product.price * (discount / 100);
    console.log(request.body.finalPrice);
  }

  const customId = product.customId;

  if (request.files.mainImage) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      request.files.mainImage[0].path,
      { folder: `${process.env.APP_NAME}/product/${customId}` }
    );

    request.body.mainImage = { secure_url, public_id };
  }
  if (request.files.subImages) {
    const uploadedImages = [];
    for (const image of request.files.subImage) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        image.path,
        { folder: `${process.env.APP_NAME}/product/${customId}/subimage` }
      );
      uploadedImages.push({ secure_url, public_id });
    }

    request.body.subImages = uploadedImages;

    //deleting images from cloud storage
    for (const image of product.subImages) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  }

  const updatedProduct = await ProductModel.updateOne(
    { _id: productId },
    request.body
  );
  if (!updatedProduct) {
    throw new Error(`Can't create  Product `, { cause: 500 });
  } else {
    return response.status(200).json({ message: "success", updatedProduct });
  }
});

export const createProduct = asyncHandler(async (request, response, next) => {
  const { category, subcategory, name, brand, price, discount } = request.body;

  if (
    !(await SubcategoryModel.findOne({ _id: subcategory, category: category }))
  ) {
    throw new Error(` Invalid category or subcategory `, {
      cause: 404,
    });
  }

  if (!(await BrandModel.findById(brand))) {
    throw new Error(` Invalid brandId `, {
      cause: 404,
    });
  }

  if (
    await ProductModel.findOne({
      name: name,
    })
  ) {
    throw new Error(`Product ${name} already exists`, { cause: 409 });
  }

  request.body.finalPrice = price - price * ((discount || 0) / 100);
  const customId = nanoid();
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    request.files.mainImage[0].path,
    { folder: `${process.env.APP_NAME}/product/${customId}` }
  );

  request.body.customId = customId;
  request.body.slug = slugify(name, { lower: true, trim: true });
  request.body.mainImage = { secure_url, public_id };
  const uploadedImages = [];
  for (const image of request.files.subImage) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      image.path,
      { folder: `${process.env.APP_NAME}/product/${customId}/subimage` }
    );
    uploadedImages.push({ secure_url, public_id });
  }

  request.body.subImages = uploadedImages;
  request.body.createdBy = request.decoded.id;

  const product = await ProductModel.create(request.body);
  if (!product) {
    throw new Error(`Can't create  Product `, { cause: 500 });
  } else {
    return response.status(200).json({ message: "success", product });
  }
});
