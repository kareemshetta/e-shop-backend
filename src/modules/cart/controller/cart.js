import { asyncHandler } from "../../../utils/errorHandling.js";
import Cartmodel from "../../../../DB/model/Cart.model.js";
import ProductModel from "../../../../DB/model/Product.model.js";

export const createCart = asyncHandler(async (request, response, next) => {
  const { productId, quantity } = request.body;

  const product = await ProductModel.findById(productId);

  if (!product) {
    throw new Error("no product found", { cause: 404 });
  }
  if (quantity > product.stock || product.isDeleted) {
    await ProductModel.updateOne(
      { _id: productId },
      { $addToSet: { wishUserList: request.decoded.id } }
    );
    throw new Error("not available this quatity it exceed stock", {
      cause: 400,
    });
  }
  const cart = await Cartmodel.findOne({ createdBy: request.decoded.id });
  if (!cart) {
    const createdCart = await Cartmodel.create({
      createdBy: request.decoded.id,
      products: [{ productId, quantity }],
    });

    return response.status(200).json({ message: "success", cart: createdCart });
  } else {
    let match = false;
    for (let index = 0; index < cart.products.length; index++) {
      if (cart.products[index].productId.toString() === productId) {
        cart.products[index].quantity = quantity;
        match = true;
        break;
      }
    }
    console.log("match" + match);
    if (!match) {
      cart.products.push({ productId, quantity });
    }

    const updatedCart = await cart.save();
    return response.status(200).json({ message: "success", updatedCart });
  }
});
