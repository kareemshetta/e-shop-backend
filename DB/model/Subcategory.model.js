import mongoose, { Types, model, Schema } from "mongoose";

const subcategorySchema = new Schema(
  {
    name: {
      type: String,
      unique: [true, "name must be unique"],
      trim: true,
      required: true,
      minLength: [2, "to short category name"],
    },
    slug: { type: String, lowercase: true, required: true },
    image: { type: Object, default: {} },
    category: {
      type: Types.ObjectId,
      required: [true, "category is required"],
      ref: "Category",
    },
    customId: {
      type: String,
      required: [true, "customId is required"],
      unique: true,
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true }, //we will changed later
  },
  { timestamps: true }
);

const subcategoryModel =
  mongoose.models.Subcategory || model("Subcategory", subcategorySchema);
export default subcategoryModel;
