import mongoose, { Types, model, Schema } from "mongoose";
const couponSchema = new Schema(
  {
    code: {
      type: String,
      unique: [true, "code must be unique"],
      trim: true,
      lowercase: true,
      required: [true, "coupon is required"],
    },
    image: { type: Object, default: {} },
    discount: {
      type: Number,
      default: 1,
    },
    usedBy: { type: [Types.ObjectId], default: [], refs: "User" },
    createdBy: { type: Types.ObjectId, refs: "User", required: true }, // updated later
    expireDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const couponModel = mongoose.models.Coupon || model("Coupon", couponSchema);
export default couponModel;
