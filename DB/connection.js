import mongoose from "mongoose";
const connectDB = () => {
  console.log(process.env.DB_LOCAL);
  return mongoose.connect(process.env.DB_ATLAS);
  // .then(res=>console.log(`DB Connected successfully on .........`))
  // .catch(err=>console.log(` Fail to connect  DB.........${err} `))
};

export default connectDB;
