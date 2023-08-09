import mongoose, { Types, model, Schema } from "mongoose";

const orderSchema = new Schema(
  {
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    address: { type: String, required: true },
    phone: [{ type: String, required: true }],

    products: {
      type: [
        {
          name: { type: String, required: true },
          productId: { type: Types.ObjectId, ref: "Product", required: true },
          quantity: { type: Number, default: 1, required: true },
          unitPrice: { type: Number, default: 0, required: true },
          finalPrice: { type: Number, default: 0, required: true },
          _id: false,
        },
      ],
    },
    couponId: { type: Types.ObjectId, ref: "Coupon" },
    finalPrice: { type: Number, default: 0, required: true },
    subTotal: { type: Number, default: 0, required: true },
    paymentType: { type: String, enum: ["cash", "card"], default: "cash" },
    status: {
      type: String,
      default: "placed",
      enum: [
        "waitpayment",
        "placed",
        "canceled",
        "rejected",
        "onway",
        "delivered",
      ],
    },
    reason: { type: String },
  },
  { timestamps: true }
);

const Ordermodel = mongoose.models.Order || model("Order", orderSchema);
export default Ordermodel;
