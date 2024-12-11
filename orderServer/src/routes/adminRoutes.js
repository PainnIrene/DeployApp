import express from "express";
import Order from "../models/Order.js";
import authMiddleware from "../middlewares/Admin/jwt.js";
import renewToken from "../middlewares/Admin/renewToken.js";

const router = express.Router();

// Get all orders
router.get("/orders", authMiddleware, renewToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // Sắp xếp theo thời gian mới nhất

    // Format lại data để phù hợp với frontend, dựa trên model thực tế
    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      userId: order.userId,
      items: order.items.map((item) => ({
        name: item.productSnapshot.name,
        price: item.price,
        quantity: item.quantity,
        image: item.productSnapshot.image,
        options: {
          [item.productSnapshot.type1]: item.productSnapshot.value1,
          [item.productSnapshot.type2]: item.productSnapshot.value2,
        },
      })),
      totalAmount: order.totalAmount,
      shippingFee: order.shippingFee,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentDetails: {
        method: order.paymentDetails?.method,
        paidAt: order.paymentDetails?.paidAt,
      },
      shippingAddress: {
        fullName: order.shippingAddress.fullName,
        phone: order.shippingAddress.phone,
        address: order.shippingAddress.address,
        province: order.shippingAddress.province,
        district: order.shippingAddress.district,
        ward: order.shippingAddress.ward,
      },
      dates: {
        created: order.createdAt,
        shipping: order.shippingDate,
        completed: order.completedDate,
        cancelled: order.cancelledDate,
        expires: order.expiresAt,
      },
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Get order statistics
router.get("/orders/stats", authMiddleware, renewToken, async (req, res) => {
  try {
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    const paymentStats = await Order.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.json({
      orderStats,
      paymentStats,
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({ message: "Failed to fetch order statistics" });
  }
});

// Get order by ID
router.get("/orders/:id", authMiddleware, renewToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Format order giống như ở trên
    const formattedOrder = {
      _id: order._id,
      userId: order.userId,
      items: order.items.map((item) => ({
        name: item.productSnapshot.name,
        price: item.price,
        quantity: item.quantity,
        image: item.productSnapshot.image,
        options: {
          [item.productSnapshot.type1]: item.productSnapshot.value1,
          [item.productSnapshot.type2]: item.productSnapshot.value2,
        },
      })),
      totalAmount: order.totalAmount,
      shippingFee: order.shippingFee,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentDetails: {
        method: order.paymentDetails?.method,
        paidAt: order.paymentDetails?.paidAt,
      },
      shippingAddress: {
        fullName: order.shippingAddress.fullName,
        phone: order.shippingAddress.phone,
        address: order.shippingAddress.address,
        province: order.shippingAddress.province,
        district: order.shippingAddress.district,
        ward: order.shippingAddress.ward,
      },
      dates: {
        created: order.createdAt,
        shipping: order.shippingDate,
        completed: order.completedDate,
        cancelled: order.cancelledDate,
        expires: order.expiresAt,
      },
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

export default router;
