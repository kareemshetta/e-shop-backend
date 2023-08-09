import mongoose, { Types, model, Schema } from "mongoose";

const brandSchema = new Schema(
  {
    name: {
      type: String,
      unique: [true, "name must be unique"],
      trim: true,
      required: true,
      minLength: [2, "to short brand name"],
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: false }, // updated later
    image: { type: Object, required: true },
  },
  { timestamps: true }
);

const Brandmodel = mongoose.models.Brand || model("Brand", brandSchema);
export default Brandmodel;
