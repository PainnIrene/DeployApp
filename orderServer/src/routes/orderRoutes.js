import express from "express";
import Order from "../models/Order.js";
import authMiddleware from "../middlewares/User/jwt.js";
import renewToken from "../middlewares/User/renewToken.js";
import { getIdFromJwt } from "../utils/jwt.js";
import { checkInventory } from "../services/product.js";

const router = express.Router();

router.post("/create", authMiddleware, renewToken, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.userId || getIdFromJwt(req.cookies.AT);

    // Calculate total amount
    let totalAmount = 0;
    items.forEach((item) => {
      totalAmount += item.price * item.quantity;
    });

    // Add shipping fee
    totalAmount += 20000;

    const order = new Order({
      userId,
      items,
      shippingAddress,
      totalAmount,
      status: "PENDING",
    });

    const savedOrder = await order.save();

    // Update cart after successful order creation
    const optionIds = items.map((item) => item.optionId);

    res.status(200).json({
      success: true,
      orderId: savedOrder._id,
      totalAmount: savedOrder.totalAmount,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create order",
    });
  }
});
router.get("/all", authMiddleware, renewToken, async (req, res) => {
  try {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    console.log("Get All Orders for user:", userId);

    const orders = await Order.find({ userId });

    if (!orders) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/:orderId", authMiddleware, renewToken, async (req, res) => {
  try {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    const { orderId } = req.params;
    console.log("Get Order Details: ", orderId);

    const order = await Order.findOne({
      _id: orderId,
      userId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post(
  "/:orderId/cancel",
  authMiddleware,
  renewToken,
  async (req, res) => {
    try {
      const userId = req.userId || getIdFromJwt(req.cookies.AT);
      const { orderId } = req.params;

      const order = await Order.findOne({
        _id: orderId,
        userId,
        status: "PENDING", // Chỉ cho phép hủy đơn hàng ở trạng thái PENDING
      });

      if (!order) {
        return res
          .status(404)
          .json({ message: "Order not found or cannot be cancelled" });
      }

      order.status = "CANCELLED";
      order.cancelledDate = new Date();
      await order.save();

      res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
router.post(
  "/:orderId/complete",
  authMiddleware,
  renewToken,
  async (req, res) => {
    try {
      const userId = req.userId || getIdFromJwt(req.cookies.AT);
      const { orderId } = req.params;

      const order = await Order.findOne({
        _id: orderId,
        userId,
        status: "SHIPPING", // Chỉ cho phép xác nhận đơn hàng ở trạng thái SHIPPING
      });

      if (!order) {
        return res
          .status(404)
          .json({ message: "Order not found or cannot be completed" });
      }

      order.status = "COMPLETED";
      order.completedDate = new Date();
      await order.save();

      res.status(200).json({
        success: true,
        message: "Order completed successfully",
      });
    } catch (error) {
      console.error("Error completing order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
