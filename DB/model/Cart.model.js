import mongoose, { Types, model, Schema } from "mongoose";

const cartSchema = new Schema(
  {
    products: {
      type: [
        {
          productId: { type: Types.ObjectId, ref: "Product" },
          quantity: { type: Number, default: 0 },
          _id: false,
        },
      ],
      default: [],
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Cartmodel = mongoose.models.Cart || model("Cart", cartSchema);
export default Cartmodel;
