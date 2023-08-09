import slugify from "slugify";
import cloudinary from "../../../utils/cloudinary.js";
import CartModel from "../../../../DB/model/Cart.model.js";
import ProductModel from "../../../../DB/model/Product.model.js";
import CouponModel from "../../../../DB/model/Coupon.model.js";
// import CouponModel from "../../../../DB/model/Coupon.model.js";
import Cartmodel from "../../../../DB/model/Cart.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import Ordermodel from "../../../../DB/model/Order.model.js";

export const createOrder = asyncHandler(async (request, response, next) => {
  const { products, address, phone, couponCode, paymentType } = request.body;
  let isCart = false;
  if (!products) {
    const cart = await Cartmodel.findOne({ createdBy: request.decoded.id });
    if (!cart?.products?.length) {
      throw new Error("check your cart it seems to be empty", { cause: 404 });
    }
    isCart = true;
    request.body.products = cart.products;
  }

  let coupon;
  if (couponCode) {
    coupon = await CouponModel.findOne({ code: couponCode.toLowerCase() });
  }
  if (!coupon && couponCode) {
    throw new Error("no such coupon with the code " + couponCode, {
      cause: 404,
    });
  }

  if (coupon && coupon.expireDate.getTime() < Date.now()) {
    throw new Error(
      "opps the coupon with the code " + couponCode + " is expired",
      {
        cause: 400,
      }
    );
  }

  if (coupon && coupon.usedBy?.includes(request.decoded.id)) {
    throw new Error(
      "opps this coupon is only valid for once  " + couponCode + "",
      {
        cause: 400,
      }
    );
  }

  const checkedProducts = [];
  const checkedProdIds = [];
  let subTotal = 0;
  for (let product of request.body.products) {
    const checkedProduct = await ProductModel.findOne({
      _id: product.productId,
      stock: { $gt: product.quantity },
      isDeleted: false,
    });
    if (!checkedProduct) {
      throw new Error("no such product with the id " + product, {
        cause: 404,
      });
    }
    if (isCart) {
      product = product.toObject();
    }

    product.name = checkedProduct.name;
    product.unitPrice = checkedProduct.price;
    product.finalPrice =
      (checkedProduct.finalPrice * product.quantity).toFixed(2) * 1;
    subTotal += product.finalPrice;
    checkedProdIds.push(checkedProduct._id);
    checkedProducts.push(product);
  }

  const constructedOrder = {
    createdBy: request.decoded.id,
    address,
    phone,
    paymentType,
    status: paymentType === "card" ? "waitpayment" : "placed",
    couponId: coupon?._id,
    products: checkedProducts,
    subTotal,
    finalPrice:
      (subTotal - (subTotal * coupon?.discount || 0) / 100).toFixed(2) * 1,
  };
  if (coupon) {
    await CouponModel.updateOne(
      { _id: coupon._id },
      { $addToSet: { usedBy: request.decoded.id } }
    );
  }

  for (const product of request.body.products) {
    await ProductModel.updateOne(
      { _id: product.productId },
      {
        $inc: {
          stock: -parseInt(product.quantity),
          sold: parseInt(product.quantity),
        },
      }
    );
  }
  if (isCart) {
    await CartModel.updateOne(
      { createdBy: request.decoded.id },
      { products: [] }
    );
  } else {
    await CartModel.updateOne(
      { createdBy: request.decoded.id },
      { $pull: { products: { productId: { $in: checkedProdIds } } } }
    );
  }

  const order = await Ordermodel.create(constructedOrder);
  if (order) {
    return response.status(201).json({ message: "success", order });
  } else {
    throw new Error("cant't create order", { cause: 400 });
  }
});

export const cancelOrder = asyncHandler(async (request, response, next) => {
  const { orderId } = request.params;
  const { reason } = request.body;
  const order = await Ordermodel.findOne({
    _id: orderId,
    createdBy: request.decoded.id,
  });

  if (!order) {
    throw new Error(`can't cancel this order invalid orderId`, {
      cause: 400,
    });
  }
  if (
    request.decoded.role != "Admin" &&
    order.createdBy.toString() !== request.decoded.id
  ) {
    throw new Error("you not authorized", { cause: 401 });
  }
  if (
    !order ||
    (order.paymentType === "cash" && order.status !== "placed") ||
    (order.paymentType === "card" && order.status !== "waitpayment")
  ) {
    throw new Error(
      `can't cancel this order ${
        !order ? "invalid orderId" : `because order status is  ${order.status}`
      } `,
      { cause: 400 }
    );
  }
  order.status = "canceled";
  order.reason = reason;
  order.updatedBy = request.decoded.id;
  const canceledOrder = await order.save();
  if (canceledOrder.status != "canceled") {
    throw new Error("can't cancel order", { cause: 400 });
  }

  if (order.couponId) {
    const coupon = await CouponModel.updateOne(
      { _id: order.couponId },
      { $pull: { usedBy: order.createdBy } }
    );
  }
  for (const product of order.products) {
    await ProductModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: product.quantity, sold: -product.quantity } }
    );
  }

  response.status(200).json({ message: "canceled" });
});

export const updateOrderStatusByAdmin = asyncHandler(
  async (request, response, next) => {
    const { orderId } = request.params;
    const { status } = request.body;
    const order = await Ordermodel.findOne({
      _id: orderId,
    });

    if (!order) {
      throw new Error(`can't cancel this order invalid orderId`, {
        cause: 400,
      });
    }

    if (
      order.status === "delivered" ||
      order.status === "canceled" ||
      order.status === "rejected"
    ) {
      throw new Error(
        `can't update  order status after it has been changed to  ${order.status}`,
        {
          cause: 400,
        }
      );
    }
    if (status === "rejected" || status === "canceled") {
      if (order.couponId) {
        const coupon = await CouponModel.updateOne(
          { _id: order.couponId },
          { $pull: { usedBy: order.createdBy } }
        );
      }
      for (const product of order.products) {
        await ProductModel.updateOne(
          { _id: product.productId },
          { $inc: { stock: product.quantity, sold: -product.quantity } }
        );
      }
    }

    const updatedOrder = await Ordermodel.updateOne(
      {
        _id: orderId,
      },
      { status, updatedBy: request.decoded.id }
    );

    if (updatedOrder.matchedCount != 0) {
      return response.json({
        message: "Succes order status updated successfully",
      });
    } else {
      throw new Error(`can't update this order invalid orderId`, {
        cause: 404,
      });
    }
  }
);

// export const createOrderByItems = asyncHandler(
//   async (request, response, next) => {
//     const { products, address, phone, couponCode, paymentType } = request.body;
//     let coupon;
//     if (couponCode) {
//       coupon = await CouponModel.findOne({ code: couponCode.toLowerCase() });
//     }
//     if (!coupon && couponCode) {
//       throw new Error("no such coupon with the code " + couponCode, {
//         cause: 404,
//       });
//     }

//     if (coupon && coupon.expireDate.getTime() < Date.now()) {
//       throw new Error(
//         "opps the coupon with the code " + couponCode + " is expired",
//         {
//           cause: 400,
//         }
//       );
//     }

//     if (coupon && coupon.usedBy?.includes(request.decoded.id)) {
//       throw new Error(
//         "opps this coupon is only valid for once  " + couponCode + "",
//         {
//           cause: 400,
//         }
//       );
//     }

//     const checkedProducts = [];
//     const checkedProdIds = [];
//     let subTotal = 0;
//     for (const product of products) {
//       const checkedProduct = await ProductModel.findOne({
//         _id: product.productId,
//         stock: { $gt: product.quantity },
//         isDeleted: false,
//       });
//       if (!checkedProduct) {
//         throw new Error("no such product with the id " + product, {
//           cause: 404,
//         });
//       }
//       product.name = checkedProduct.name;
//       product.unitPrice = checkedProduct.price;
//       product.finalPrice =
//         (checkedProduct.finalPrice * product.quantity).toFixed(2) * 1;
//       subTotal += product.finalPrice;
//       checkedProdIds.push(checkedProduct._id);
//       checkedProducts.push(product);
//     }

//     const constructedOrder = {
//       createdBy: request.decoded.id,
//       address,
//       phone,
//       paymentType,
//       status: paymentType === "card" ? "waitpayment" : "placed",
//       couponId: coupon?._id,
//       products: checkedProducts,
//       subTotal,
//       finalPrice:
//         (subTotal - (subTotal * coupon?.discount || 0) / 100).toFixed(2) * 1,
//     };
//     if (coupon) {
//       await CouponModel.updateOne(
//         { _id: coupon._id },
//         { $addToSet: { usedBy: request.decoded.id } }
//       );
//     }

//     for (const product of products) {
//       await ProductModel.updateOne(
//         { _id: product.productId },
//         {
//           $inc: {
//             stock: -parseInt(product.quantity),
//             sold: parseInt(product.quantity),
//           },
//         }
//       );
//     }

//     const card = await CartModel.updateOne(
//       { createdBy: request.decoded.id },
//       { $pull: { products: { productId: { $in: checkedProdIds } } } }
//     );

//     const order = await Ordermodel.create(constructedOrder);
//     if (order) {
//       return response.status(201).json({ message: "success", order });
//     } else {
//       throw new Error("cant't create order", { cause: 400 });
//     }
//   }
// );
// stock 16  sold 70
