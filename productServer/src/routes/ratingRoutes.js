import express from "express";
import Rating from "../models/Rating.js";
import authMiddleware from "../middlewares/User/jwt.js";
import renewToken from "../middlewares/User/renewToken.js";
import { getIdFromJwt } from "../utils/jwt.js";

const router = express.Router();

// Create a new rating
router.post("/create", authMiddleware, renewToken, async (req, res) => {
  try {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    const { productId, orderId, rating, comment, userName, userAvatar } =
      req.body;

    // Log để debug
    console.log("Received rating data:", {
      userId,
      productId,
      orderId,
      rating,
      comment,
      userName,
      userAvatar,
    });

    // Validate required fields với thông báo cụ thể
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }
    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required",
      });
    }
    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      userId,
      productId,
      orderId,
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this product for this order",
      });
    }

    const newRating = new Rating({
      userId,
      productId,
      orderId,
      rating,
      comment,
      userName: userName || "Anonymous",
      userAvatar: userAvatar || "default-avatar-url",
    });

    await newRating.save();

    res.status(201).json({
      success: true,
      rating: newRating,
    });
  } catch (error) {
    console.error("Error creating rating:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create rating",
    });
  }
});

// Get ratings for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    // Lấy tất cả ratings của sản phẩm
    const ratings = await Rating.find({ productId });

    // Tính toán thống kê
    const totalRatings = ratings.length;
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalStars = 0;

    ratings.forEach((rating) => {
      distribution[rating.rating]++;
      totalStars += rating.rating;
    });

    const averageRating =
      totalRatings > 0 ? (totalStars / totalRatings).toFixed(1) : 0;

    res.json({
      averageRating: Number(averageRating),
      totalRatings,
      distribution,
    });
  } catch (error) {
    console.error("Error getting product ratings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Check if user has rated a product for a specific order
router.get(
  "/check/:orderId/:productId",
  authMiddleware,
  renewToken,
  async (req, res) => {
    try {
      const userId = req.userId || getIdFromJwt(req.cookies.AT);
      const { orderId, productId } = req.params;

      const rating = await Rating.findOne({
        userId,
        productId,
        orderId,
      });

      res.status(200).json({
        success: true,
        hasRated: !!rating,
        rating: rating,
      });
    } catch (error) {
      console.error("Error checking rating:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to check rating",
      });
    }
  }
);

router.get("/details/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    // Lấy ratings với thông tin đầy đủ
    const ratings = await Rating.find({ productId }).sort({ createdAt: -1 }); // Sắp xếp theo thời gian mới nhất

    // Format lại data trước khi trả về
    const formattedRatings = ratings.map((rating) => ({
      _id: rating._id,
      rating: rating.rating,
      comment: rating.comment,
      createdAt: rating.createdAt,
      user: {
        name: rating.userName,
        avtUrl: rating.userAvatar,
      },
      orderId: rating.orderId,
    }));

    res.json({
      ratings: formattedRatings,
    });
  } catch (error) {
    console.error("Error getting rating details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
