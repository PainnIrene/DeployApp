import express from "express";
import authMiddleware from "../middlewares/User/jwt.js";
import renewToken from "../middlewares/User/renewToken.js";
import { createPayPalOrder, createStripeSession } from "../services/payment.js";
import Order from "../models/Order.js";
import { updateCartAfterOrder } from "../services/cart.js";
import { updateProductInventory } from "../services/product.js";
const router = express.Router();

router.post("/create-session", authMiddleware, renewToken, async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    // Validate input
    if (!orderId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing orderId or paymentMethod",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order already paid",
      });
    }

    let paymentSession;

    try {
      if (paymentMethod === "paypal") {
        paymentSession = await createPayPalOrder(orderId, order.totalAmount);
        return res.json({
          success: true,
          paymentId: paymentSession.id,
        });
      } else if (paymentMethod === "stripe") {
        paymentSession = await createStripeSession(orderId, order.totalAmount);
        return res.json({
          success: true,
          sessionId: paymentSession.id,
          url: paymentSession.url,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid payment method",
        });
      }
    } catch (paymentError) {
      console.error("Payment creation error:", paymentError);
      return res.status(500).json({
        success: false,
        message: "Failed to create payment session",
        error: paymentError.message,
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Xác nhận payment thành công
router.post("/confirm", authMiddleware, renewToken, async (req, res) => {
  try {
    const { orderId, paymentId, paymentMethod } = req.body;

    if (!orderId || !paymentId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update cart after successful payment
    try {
      await updateCartAfterOrder(order.userId, order.items);
    } catch (cartError) {
      console.error("Error updating cart:", cartError);
      return res.status(500).json({
        success: false,
        message: "Failed to update cart",
      });
    }

    // Update inventory for each item in the order
    try {
      for (const item of order.items) {
        await updateProductInventory(
          item.productId,
          item.optionId,
          item.quantity
        );
      }
    } catch (inventoryError) {
      console.error("Error updating inventory:", inventoryError);
      return res.status(500).json({
        success: false,
        message: "Failed to update inventory",
      });
    }

    // Update order status and payment details
    order.paymentStatus = "paid";
    order.status = "CONFIRMED";
    order.paymentDetails = {
      method: paymentMethod,
      paymentId: paymentId,
      paidAt: new Date(),
    };

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
