import userModel from "../../DB/model/User.model.js";
import { asyncHandler } from "../utils/errorHandling.js";
import { verifyToken } from "../utils/GenerateAndVerifyToken.js";
export const auth = (...roles) =>
  asyncHandler(async (request, response, next) => {
    const { authorization } = request.headers;
    console.log(
      "authorization: " + authorization,
      !authorization?.startsWith(process.env.BEARER_KEY)
    );

    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      throw new Error(`In-valid bearer key`, { cause: 401 });
    }
    const token = authorization.split(process.env.BEARER_KEY)[1];

    if (!token) {
      throw new Error(`In-valid token`, { cause: 401 });
    }

    const decoded = verifyToken({ token });

    if (!decoded?.id) {
      throw new Error(`In-valid token payload`, { cause: 401 });
    }
    console.log("calleddddddddddddddddddddddddddddddd", decoded);
    const user = await userModel
      .findById(decoded.id)
      .select("userName role _id email passwordChangedAt");
    if (!user) {
      throw new Error(`not registered user`, { cause: 401 });
    }
    console.log("user", !user.passwordChangedAt);
    if (user.passwordChangedAt) {
      const passwordTimeInMinutes = parseInt(
        user.passwordChangedAt.getTime() / 1000
      );

      if (passwordTimeInMinutes > parseInt(decoded.iat)) {
        console.log("okey");
        throw new Error(`expired Token`, { cause: 401 });
      }
    }
    request.decoded = user;
    console.log(request.decoded.role);
    if (roles.includes(request.decoded.role)) {
      next();
    } else {
      throw new Error("not authorized ", { cause: 401 });
    }
  });

export default auth;

// export const isAllowTo = (...roles) => {
//   return async (request, response, next) => {
//     auth(request, response, () => {
//       if (roles.includes(request.decoded.role)) {
//         console.log(request.decoded);
//         next();
//       } else {
//         next();
//       }
//     });
//   };
// };
