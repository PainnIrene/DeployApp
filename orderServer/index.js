import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/connectDB.js";
import cookieParser from "cookie-parser";
import orderRoutes from "./src/routes/orderRoutes.js";
import orderRoutesSeller from "./src/routes/orderRoutesSeller.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import connectRedis from "./src/config/connectRedis.js";
import cors from "cors";
dotenv.config();
const PORT = process.env.PORT || 3003;
const MONGODB_URL = process.env.MONGODB_URL;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3006",
      "http://localhost:3005",
    ], // React client URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  })
);
app.use("/order", orderRoutes);
app.use("/orderSeller", orderRoutesSeller);
app.use("/payment", paymentRoutes);
app.use("/admin", adminRoutes);
const startServer = async () => {
  try {
    connectDB(MONGODB_URL);
    await connectRedis.connect();
    app.listen(PORT, () => {
      console.log("Order Server is running on PORT: " + PORT);
    });
  } catch (error) {
    console.log(error);
  }
};
startServer();
