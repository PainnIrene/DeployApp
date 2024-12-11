import express from "express";
import Product from "../models/Product.js";
import authMiddleware from "../middlewares/Admin/jwt.js";
import renewToken from "../middlewares/Admin/renewToken.js";

const router = express.Router();

// Get product statistics
router.get("/products/stats", authMiddleware, renewToken, async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      total: 0,
      published: 0,
      hidden: 0,
      violation: 0,
    };

    stats.forEach((stat) => {
      formattedStats.total += stat.count;
      switch (stat._id) {
        case "PUBLISHED":
          formattedStats.published = stat.count;
          break;
        case "HIDDEN":
          formattedStats.hidden = stat.count;
          break;
        case "VIOLATION":
          formattedStats.violation = stat.count;
          break;
      }
    });

    res.json(formattedStats);
  } catch (error) {
    console.error("Error fetching product stats:", error);
    res.status(500).json({ message: "Failed to fetch product statistics" });
  }
});

// Get all products with REFER status
router.get("/products/refer", authMiddleware, renewToken, async (req, res) => {
  try {
    const products = await Product.find({ status: "REFER" })
      .select("name description promotionImage images")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Get product by ID
router.get("/products/:id", authMiddleware, renewToken, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Failed to fetch product details" });
  }
});

// Get all products
router.get("/products", authMiddleware, renewToken, async (req, res) => {
  try {
    const products = await Product.find()
      .select("name promotionImage price inStock status shopName")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Update product status
router.patch(
  "/products/:id/status",
  authMiddleware,
  renewToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ["PUBLISHED", "HIDDEN", "VIOLATION"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message:
            "Invalid status. Must be one of: PUBLISHED, HIDDEN, VIOLATION",
        });
      }

      const product = await Product.findByIdAndUpdate(
        id,
        {
          status,
          updatedAt: Date.now(),
        },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({
        message: "Product status updated successfully",
        product,
      });
    } catch (error) {
      console.error("Error updating product status:", error);
      res.status(500).json({ message: "Failed to update product status" });
    }
  }
);

export default router;
