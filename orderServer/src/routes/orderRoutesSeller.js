import express from "express";
import Order from "../models/Order.js";
import authMiddleware from "../middlewares/Seller/jwt.js";
import renewToken from "../middlewares/Seller/renewToken.js";
import { getIdFromJwt } from "../utils/jwt.js";
const router = express.Router();

router.get("/all", authMiddleware, renewToken, async (req, res) => {
  try {
    const userId = req.userId || getIdFromJwt(req.cookies.SAT);

    // Get query parameters
    const orderKey = req.query.orderKey || "createdAt";
    const orderType = req.query.orderType === "asc" ? 1 : -1;
    const pageIndex = parseInt(req.query.pageIndex) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const status = req.query.status || "all";
    const skip = pageIndex * pageSize;

    // Build pipeline
    let pipeline = [
      {
        $match: {
          "items.sellerId": userId,
        },
      },
    ];

    // Unwind items array để có thể filter theo sellerId
    pipeline.push({ $unwind: "$items" });
    pipeline.push({
      $match: {
        "items.sellerId": userId,
      },
    });

    // Group lại để tránh duplicate orders
    pipeline.push({
      $group: {
        _id: "$_id",
        userId: { $first: "$userId" },
        items: { $push: "$items" },
        shippingAddress: { $first: "$shippingAddress" },
        status: { $first: "$status" },
        totalAmount: { $first: "$totalAmount" },
        createdAt: { $first: "$createdAt" },
        shippingDate: { $first: "$shippingDate" },
        shippingFee: { $first: "$shippingFee" },
        paymentStatus: { $first: "$paymentStatus" },
        paymentDetails: { $first: "$paymentDetails" },
        completedDate: { $first: "$completedDate" },
        cancelledDate: { $first: "$cancelledDate" },
      },
    });

    // Add sorting based on orderKey
    if (orderKey === "totalAmount") {
      pipeline.push({ $sort: { totalAmount: orderType } });
    } else if (orderKey === "createdAt") {
      pipeline.push({ $sort: { createdAt: orderType } });
    } else if (orderKey === "status") {
      pipeline.push({ $sort: { status: orderType } });
    }

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: pageSize });

    const orders = await Order.aggregate(pipeline).exec();

    // Get total count for pagination
    const totalOrders = await Order.aggregate([
      { $match: { "items.sellerId": userId } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]).exec();

    res.status(200).json({
      orders,
      totalPages: Math.ceil((totalOrders[0]?.count || 0) / pageSize),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint để cập nhật một đơn hàng thành shipping
router.patch(
  "/:orderId/shipping",
  authMiddleware,
  renewToken,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { shippingDate } = req.body;
      const userId = req.userId || getIdFromJwt(req.cookies.SAT);

      const order = await Order.findOneAndUpdate(
        {
          _id: orderId,
          "items.sellerId": userId,
          status: "PENDING",
        },
        {
          $set: {
            status: "SHIPPING",
            shippingDate: shippingDate,
          },
        },
        { new: true }
      );

      if (!order) {
        return res
          .status(404)
          .json({ message: "Order not found or not eligible for shipping" });
      }

      res.status(200).json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Endpoint để cập nhật tất cả đơn hàng thành shipping
router.patch("/complete-all", authMiddleware, renewToken, async (req, res) => {
  try {
    const { shippingDate } = req.body;
    const userId = req.userId || getIdFromJwt(req.cookies.SAT);

    const result = await Order.updateMany(
      {
        "items.sellerId": userId,
        status: "PENDING",
      },
      {
        $set: {
          status: "SHIPPING",
          shippingDate: shippingDate,
        },
      }
    );

    res.status(200).json({
      message: "All eligible orders updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Thêm route mới
router.get("/shipping", authMiddleware, renewToken, async (req, res) => {
  try {
    const { orderKey, orderType, pageIndex = 0, pageSize = 5 } = req.query;
    const sellerId = req.userId || getIdFromJwt(req.cookies.SAT);

    let sort = {};
    if (orderKey && orderType) {
      sort[orderKey] = orderType === "asc" ? 1 : -1;
    }

    const query = {
      "items.sellerId": sellerId,
      status: "SHIPPING",
    };

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / pageSize);

    const orders = await Order.find(query)
      .sort(sort)
      .skip(pageIndex * pageSize)
      .limit(parseInt(pageSize));

    res.status(200).json({
      orders,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching shipping orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route cho đơn hàng đã hoàn thành
router.get("/completed", authMiddleware, renewToken, async (req, res) => {
  try {
    const { orderKey, orderType, pageIndex = 0, pageSize = 5 } = req.query;
    const sellerId = req.userId || getIdFromJwt(req.cookies.SAT);

    let sort = {};
    if (orderKey && orderType) {
      sort[orderKey] = orderType === "asc" ? 1 : -1;
    }

    const query = {
      "items.sellerId": sellerId,
      status: "COMPLETED",
    };

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / pageSize);

    const orders = await Order.find(query)
      .sort(sort)
      .skip(pageIndex * pageSize)
      .limit(parseInt(pageSize));

    res.status(200).json({
      orders,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route cho đơn hàng đã hủy
router.get("/cancelled", authMiddleware, renewToken, async (req, res) => {
  try {
    const { orderKey, orderType, pageIndex = 0, pageSize = 5 } = req.query;
    const sellerId = req.userId || getIdFromJwt(req.cookies.SAT);

    let sort = {};
    if (orderKey && orderType) {
      sort[orderKey] = orderType === "asc" ? 1 : -1;
    }

    const query = {
      "items.sellerId": sellerId,
      status: "CANCELLED",
    };

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / pageSize);

    const orders = await Order.find(query)
      .sort(sort)
      .skip(pageIndex * pageSize)
      .limit(parseInt(pageSize));

    res.status(200).json({
      orders,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching cancelled orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get dashboard statistics
router.get("/dashboard-stats", authMiddleware, renewToken, async (req, res) => {
  try {
    const sellerId = req.userId || getIdFromJwt(req.cookies.SAT);
    const { timeRange = "month" } = req.query; // month, 3months, 6months, all

    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "3months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "6months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case "all":
        startDate = new Date(2000, 0, 1); // Arbitrary past date
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get daily stats for chart
    const dailyStats = await Order.aggregate([
      {
        $match: {
          "items.sellerId": sellerId,
          createdAt: { $gte: startDate },
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: {
            $sum: {
              $reduce: {
                input: {
                  $filter: {
                    input: "$items",
                    cond: { $eq: ["$$this.sellerId", sellerId] },
                  },
                },
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $multiply: ["$$this.price", "$$this.quantity"] },
                  ],
                },
              },
            },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get current date and start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total orders count
    const totalOrders = await Order.countDocuments({
      "items.sellerId": sellerId,
    });

    // Get monthly orders
    const monthlyOrderCount = await Order.countDocuments({
      "items.sellerId": sellerId,
      createdAt: { $gte: startOfMonth },
    });

    // Get orders by status
    const pendingOrders = await Order.countDocuments({
      "items.sellerId": sellerId,
      status: "PENDING",
    });

    const completedOrders = await Order.countDocuments({
      "items.sellerId": sellerId,
      status: "COMPLETED",
    });

    const cancelledOrders = await Order.countDocuments({
      "items.sellerId": sellerId,
      status: "CANCELLED",
    });

    // Get total revenue
    const orders = await Order.find({
      "items.sellerId": sellerId,
      status: "COMPLETED",
    });

    const totalRevenue = orders.reduce((acc, order) => {
      const sellerItems = order.items.filter(
        (item) => item.sellerId === sellerId
      );
      const revenue = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return acc + revenue;
    }, 0);

    // Get monthly revenue
    const monthlyOrders = await Order.find({
      "items.sellerId": sellerId,
      status: "COMPLETED",
      createdAt: { $gte: startOfMonth },
    });

    const monthlyRevenue = monthlyOrders.reduce((acc, order) => {
      const sellerItems = order.items.filter(
        (item) => item.sellerId === sellerId
      );
      const revenue = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return acc + revenue;
    }, 0);

    res.json({
      success: true,
      data: {
        totalOrders,
        monthlyOrders: monthlyOrderCount,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        monthlyRevenue,
        dailyStats,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
});

export default router;
