import slugify from "slugify";
import { nanoid } from "nanoid";
import cloudinary from "../../../utils/cloudinary.js";
import CouponModel from "../../../../DB/model/Coupon.model.js";

import { asyncHandler } from "../../../utils/errorHandling.js";
export const createCoupon = asyncHandler(async (request, response, next) => {
  // console.log(request.body, request.file);

  const { code } = request.body;
  if (await CouponModel.findOne({ code })) {
    // return next(new Error(`Category ${name} already exists`, { cause: 409 }));
    throw new Error(`Coupon ${code} already exists`, { cause: 409 });
  }
  if (request.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      request.file.path,
      {
        folder: `${process.env.APP_NAME}/coupon/}`,
      }
    );

    request.body.image = { secure_url, public_id };
  }
  request.body.createdBy = request.decoded.id;
  request.body.expireDate = new Date(request.body.expireDate);
  const Coupon = await CouponModel.create(request.body);
  if (Coupon) return response.status(201).json({ message: "done", Coupon });
});
// update ////////////////////////////////////////////////////
export const updateCoupon = asyncHandler(async (request, response, next) => {
  console.log(request.body, request.file);
  const { couponId } = request.params;
  const { code } = request.body;
  const coupon = await CouponModel.findOne({
    _id: couponId,
  });
  if (!coupon) {
    throw new Error(` invalid CouponId  `, { cause: 404 });
  }

  if (request.body.code) {
    if (coupon.code === request.body.code) {
      throw new Error(`cannot update you have provided the same code  `, {
        cause: 409,
      });
    }
    if (await CouponModel.findOne({ code })) {
      throw new Error(`this Coupon code is already exists   `, {
        cause: 409,
      });
    }
    coupon.code = code;
  }
  if (request.body.discount) {
    coupon.discount = request.body.discount;
  }
  if (request.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      request.file.path,
      {
        folder: `${process.env.APP_NAME}/coupon/`,
      }
    );
    if (coupon.image) {
      await cloudinary.uploader.destroy(coupon.image.public_id);
    }

    coupon.image = { secure_url, public_id };
  }
  const updatedCoupon = await coupon.save();

  if (updatedCoupon)
    return response.status(201).json({ message: "done", updatedCoupon });
});

export const getAllCoupon = asyncHandler(async (request, response, next) => {
  const coupones = await CouponModel.find();
  if (!coupones) throw new Error("there're no  coupones", { cause: 404 });
  coupones && response.status(200).json({ message: "success", coupones });
});
