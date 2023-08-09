import connectDB from "../DB/connection.js";
import authRouter from "./modules/auth/auth.router.js";
import branRouter from "./modules/brand/brand.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import categoryRouter from "./modules/category/category.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import orderRouter from "./modules/order/order.router.js";
import productRouter from "./modules/product/product.router.js";
import reviewsRouter from "./modules/reviews/reviews.router.js";
import subcategoryRouter from "./modules/subcategory/subcategory.router.js";
import userRouter from "./modules/user/user.router.js";

const initApp = (app, express) => {
  //convert Buffer Data into JSON
  app.use(express.json({}));
  //Setup API Routing
  app.use(`/auth`, authRouter);
  app.use(`/user`, userRouter);
  app.use(`/product`, productRouter);
  app.use(`/category`, categoryRouter);
  app.use(`/subCategory`, subcategoryRouter);
  app.use(`/reviews`, reviewsRouter);
  app.use(`/coupon`, couponRouter);
  app.use(`/cart`, cartRouter);
  app.use(`/order`, orderRouter);
  app.use(`/brand`, branRouter);

  
  // setup port and the baseUrl
  const port = process.env.PORT || 5000;
  connectDB()
    .then((res) => {
      console.log(`DB Connected successfully on .........`);

      app.listen(port, () =>
        console.log(`Example app listening on port ${port}!`)
      );
    })
    .catch((err) => console.log(` Fail to connect  DB.........${err} `));
};

export default initApp;
