import mongoose from "mongoose";
const connectDB = (connection_string) => {
  mongoose
    .connect(connection_string)
    .then(() => {
      console.log("ProductDB connected");
    })
    .catch((err) => {
      console.log(err);
    });
};

export default connectDB;
