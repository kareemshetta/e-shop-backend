import mongoose, { Types, model, Schema } from "mongoose";

const categorySchema = new Schema(
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
    createdBy: { type: Types.ObjectId, ref: "User", required: true }, //we will changed later
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
categorySchema.virtual("subcategory", {
  localField: "_id",
  foreignField: "category",
  ref: "Subcategory",
});
const categoryModel =
  mongoose.models.Category || model("Category", categorySchema);
export default categoryModel;
