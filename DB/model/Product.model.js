import mongoose, { Types, model, Schema } from "mongoose";
const productSchema = new Schema(
  {
    customId: String,
    name: {
      type: String,
      lowercase: true,
      unique: [true, "product title must be unique"],
      trim: true,
      required: true,
      minLength: [2, "to short product name"],
    },
    description: {
      type: String,
      minLength: [5, "to short description"],
      maxLength: [1000, "too long description"],
      required: [true, "description is required"],
      trim: true,
    },
    slug: { type: String, lowercase: true, required: true },
    mainImage: { type: Object },
    subImages: { type: [Object], default: [] },

    price: {
      type: Number,
      min: 0,
      default: 1,
      required: [true, "product price is requird"],
    },
    finalPrice: { type: Number, min: 0 },
    discount: { type: Number, min: 0, default: 0 },
    // ratingCount: { type: Number, min: 0, default: 0 },
    // ratingAvg: {
    //   type: Number,
    //   min: [1, "rating average must be greater than 1"],
    //   max: [5, "rating average must be less than or equal 5 "],
    // },

    stock: {
      type: Number,
      default: 0,
      min: 0,
      //   required: [true, "quantity is required"],
    },
    colors: [String],
    sizes: { type: [String], enum: ["s", "m", "l", "xl"] },
    sold: { type: Number, default: 0, min: 0 },
    category: {
      type: Types.ObjectId,
      refs: "category",
      required: [true, "category is required"],
    },
    subcategory: {
      type: Types.ObjectId,
      refs: "subcategory",
      required: [true, "subcategory is required"],
    },
    brand: { type: Types.ObjectId, refs: "Brand" },
    createdBy: { type: Types.ObjectId, refs: "User" },
    updatedBy: { type: Types.ObjectId, refs: "User" },
    wishUserList: {
      type: [{ type: Types.ObjectId, refs: "User" }],
      default: [],
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const productModel = mongoose.models.Product || model("Product", productSchema);

export default productModel;
