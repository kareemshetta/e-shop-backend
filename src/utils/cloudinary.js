import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../config/.env") });

import cloudinary from "cloudinary";

console.log(
  process.env.api_key,
  process.env.api_secret,
  process.env.cloud_name
);

cloudinary.v2.config({
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
  cloud_name: process.env.cloud_name,
  secure: true,
});

export default cloudinary.v2;
