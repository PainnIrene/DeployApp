import express from "express";
import cookieParser from "cookie-parser";
const app = express();
import cors from "cors";

import connectDB from "./config/connectDB.js";
import connectRedis from "./config/connectRedis.js";
import { connectRabbitMQ, closeConnection } from "./config/connectRabbitMQ.js";
import dotenv from "dotenv";
import startGrpcServer from "./config/gRPC_Server.js";
dotenv.config();
const PORT = process.env.PORT || 3001;
const MONGODB_URL = process.env.MONGODB_URL;
import authRoutes from "./src/routes/userRoutes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes/userRoutes.js";
import sellerRoutes from "./src/routes/sellerRoutes/sellerRoutes.js";
import cartRoutes from "./src/routes/userRoutes/cartRoutes.js";
import adminRoutes from "./src/routes/adminRoutes/adminRoutes.js";
import test from "./src/routes/test.js";
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3006",
      "http://localhost:3005",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/seller", sellerRoutes);
app.use("/cart", cartRoutes);
app.use("/", test);
app.use("/admin", adminRoutes);

const startServer = async () => {
  try {
    connectDB(MONGODB_URL);
    await connectRedis.connect();
    await connectRabbitMQ();
    startGrpcServer();
    app.listen(PORT, () => {
      console.log("User Server is running on PORT: " + PORT);
    });
    process.on("exit", () => closeConnection());
    process.on("SIGINT", () => process.exit());
    process.on("SIGTERM", () => process.exit());
  } catch (error) {
    console.log(error);
  }
};

startServer();
