import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/models/connectDB.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import productRoutes from "./src/routes/productRoutes.js";
import ratingRoutes from "./src/routes/ratingRoutes.js";
import connectRedis from "./src/config/connectRedis.js";
import startGrpcServer from "./src/config/gRPC_Server.js";
import {
  connectRabbitMQ,
  closeConnection,
} from "./src/config/connectRabbitMQ.js";
import adminRoutes from "./src/routes/adminRoutes.js";
dotenv.config();
const PORT = process.env.PORT || 3002;
const MONGODB_URL = process.env.MONGODB_URL;
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:3006",
      "http://localhost:3000",
      "http://localhost:3005",
    ],
    credentials: true,
  })
);
app.use("/product", productRoutes);
app.use("/rating", ratingRoutes);
app.use("/admin", adminRoutes);
const startServer = async () => {
  try {
    connectRabbitMQ();
    connectDB(MONGODB_URL);
    await connectRedis.connect();
    app.listen(PORT, () => {
      console.log("Product Server is running on PORT: " + PORT);
    });
    startGrpcServer();
  } catch (error) {
    console.log(error);
  }
};
startServer();
