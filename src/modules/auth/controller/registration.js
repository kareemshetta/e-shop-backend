import cloudinary from "../../../utils/cloudinary.js";
import UserModel from "../../../../DB/model/User.model.js";
import sendEmail, {
  getSendCodeHtml,
  getStyleHtml,
} from "../../../utils/email.js";
import { compare, hash } from "../../../utils/HashAndCompare.js";
import {
  generateToken,
  verifyToken,
} from "../../../utils/GenerateAndVerifyToken.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { customAlphabet } from "nanoid";

export const signUp = asyncHandler(async (request, response, next) => {
  console.log("hi");
  const { password, email, userName } = request.body;
  console.log(password);
  if (await UserModel.findOne({ email })) {
    // return next(new Error(`Category ${name} already exists`, { cause: 409 }));
    throw new Error(`User ${email} already exists`, { cause: 409 });
  }

  const token = generateToken({ payload: { email }, expiresIn: 60 * 1 });

  const refreshToken = generateToken({
    payload: { email },
    expiresIn: 60 * 60 * 24 * 30,
  });
  // console.log(token, refreshToken);
  const link = `${request.protocol}://${request.headers.host}/auth/confirmEmail/${token}`;
  const refreshLink = `${request.protocol}://${request.headers.host}/auth/newConfirmEmail/${refreshToken}`;

  if (
    !(await sendEmail({
      to: email,
      subject: "verification Email ",
      html: getStyleHtml({ link, refreshLink }),
    }))
  ) {
    throw new Error("invalid Email", { cause: 404 });
  }
  const hashed = hash({ plaintext: password });
  //hash

  const user = await new UserModel({
    email,
    password: hashed,
    userName,
  }).save();
  if (!user) {
    throw new Error("no user added check your data", { cause: 404 });
  }

  response
    .status(201)
    .json({ message: "success check your email for verification" });
});
//###########################comfirm email####
export const confirmEmail = asyncHandler(async (request, response, next) => {
  const { token } = request.params;

  const { email } = verifyToken({ token });
  if (!email) {
    throw Error("invalid token payload", { cause: 400 });
  }
  console.log(email);
  const user = await UserModel.updateOne({ email }, { confirmEmail: true });
  console.log(user);
  if (user.matchedCount) {
    return response.status(200).redirect("https://www.google.com");
  } else {
    throw Error("not registerd account", { cause: 404 });
  }
});

export const requestNewConfirmEmail = asyncHandler(
  async (request, response, next) => {
    const { token } = request.params;

    const { email } = verifyToken({ token });
    if (!email) {
      throw Error("invalid token payload", { cause: 400 });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw Error("not registerd account", { cause: 404 });
    }

    if (user.confirmEmail) {
      return response.status(200).redirect("https://www.google.com");
    }

    const newtoken = generateToken({ payload: { email }, expiresIn: 60 * 2 });

    const link = `${request.protocol}://${request.headers.host}/auth/confirmEmail/${newtoken}`;
    const refreshLink = `${request.protocol}://${request.headers.host}/auth/newConfirmEmail/${token}`;

    if (
      !(await sendEmail({
        to: email,
        subject: "verification Email ",
        html: getStyleHtml({ link, refreshLink }),
      }))
    ) {
      throw new Error("invalid Email", { cause: 404 });
    }
    return response
      .status(201)
      .json({ message: "new confirmation email is sent to your email" });
  }
);

export const signIn = asyncHandler(async (request, response, next) => {
  const { password, email } = request.body;
  const user = await UserModel.findOne({ email: email });
  console.log(user);
  if (!user) {
    throw new Error(
      ` sorry there's no account found check your credentials51541515`,
      {
        cause: 404,
      }
    );
  }
  if (!user.confirmEmail) {
    throw new Error(` sorry you have to confirm your email first`, {
      cause: 400,
    });
  }
  const match = compare({ plaintext: password, hashValue: user.password });
  console.log(match);
  if (match) {
    const accessToken = generateToken({
      payload: { email, role: user.role, id: user._id },
      expiresIn: 60 * 60,
    });
    const refreshToken = generateToken({
      payload: { email, role: user.role, id: user._id },
      expiresIn: 60 * 60 * 24 * 365,
    });
    user.status = "online";
    await user.save();
    return response
      .status(200)
      .json({ message: "success", accessToken, refreshToken });
  } else {
    throw new Error(` sorry there's no account found check your credentials`, {
      cause: 404,
    });
  }
});

export const forgetPassword = asyncHandler(async (request, response, next) => {
  const { email, resetCode, password } = request.body;
  const user = await UserModel.findOne({ email: email });
  console.log(user);
  if (!user) {
    throw new Error(` sorry there's no account found check your credentials`, {
      cause: 404,
    });
  }
  if (user.resetCode !== resetCode) {
    throw new Error(` sorry there's invalid reset code`, {
      cause: 404,
    });
  }
  const hashed = hash({ plaintext: password });
  user.password = hashed;
  user.resetCode = "";
  user.passwordChangedAt = Date.now();
  const updatedUser = await user.save();
  return updatedUser
    ? response
        .status(200)
        .json({ message: "success .. password changed successfully" })
    : next(new Error("check your date"), { cause: 404 });
});

export const sendVerificationCode = asyncHandler(
  async (request, response, next) => {
    const { email } = request.body;
    const user = await UserModel.findOne({ email: email });
    console.log(user);
    if (!user) {
      throw new Error(
        ` sorry there's no account found check your credentials51541515`,
        {
          cause: 404,
        }
      );
    }

    const verficationCode = customAlphabet("1234kg56789", 5)();

    if (
      !(await sendEmail({
        to: email,
        subject: "verification Email ",
        html: getSendCodeHtml({ code: verficationCode }),
      }))
    ) {
      throw new Error("invalid Email", { cause: 404 });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { email: email },
      { resetCode: verficationCode },
      { new: true }
    );
    return updatedUser
      ? response
          .status(200)
          .json({ message: "success", code: updatedUser.resetCode })
      : next(new Error("check your data"), { cause: 404 });
  }
);

export const changePassword = asyncHandler(async (request, response, next) => {
  console.log("user man", request.decoded);
  const { oldPassword, password } = request.body;
  const { email } = request.decoded;

  const user = await UserModel.findOne({ email: email });

  if (!user) {
    throw new Error(` sorry there's no account found check your credentials`, {
      cause: 404,
    });
  }

  const match = compare({ plaintext: oldPassword, hashValue: user.password });
  console.log(match);
  if (match) {
    const hashed = hash({ plaintext: password });
    user.password = hashed;
    user.passwordChangedAt = Date.now();
    user.status = "offline";

    await user.save();

    return response
      .status(200)
      .json({ message: "success password changed successfully" });
  } else {
    
    throw new Error(` oldPassword is wrong  `, {
      cause: 404,
    });
  }
});
