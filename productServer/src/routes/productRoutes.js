import express from "express";
import Product from "../models/Product.js";
const router = express.Router();
import multer from "multer";
import { UploadProductImages } from "../services/resources.js";
import authMiddleware from "../middlewares/Seller/jwt.js";
import renewToken from "../middlewares/Seller/renewToken.js";
import {
  isSellerOwnProduct,
  getProductInfoToValidate,
} from "../utils/product.js";
import { getIdFromJwt } from "../utils/jwt.js";
import { validationProduct } from "../services/detect.js";

const upload = multer({ storage: multer.memoryStorage() }); // Sử dụng memory storage để lưu trữ tạm thời

router.get("/find", async (req, res) => {
  const optionId = "66f0f927b66a2625c7a189c0";

  try {
    const product = await Product.findOne(
      { "options._id": optionId },
      {
        name: 1,
        promotionImage: 1,
        "options.$": 1,
      }
    );

    if (!product) {
      return res.status(404).json({ message: "Option not found" });
    }

    const option = product.options[0];
    return res.json({
      productName: product.name,
      price: option.price,
      promotionImage: option.image ? option.image : product.promotionImage,
      value1:
        option.value1 && option.value1 !== "undefined" ? option.value1 : "",
      value2:
        option.value2 && option.value2 !== "undefined" ? option.value2 : "",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/checkToken", authMiddleware, renewToken, async (req, res) => {
  const userId = req.userId || getIdFromJwt(req.cookies.SAT);
  if (userId) res.send(userId).status(200);
  else res.send("NONE").status(500);
});

router.get("/all", authMiddleware, renewToken, async (req, res) => {
  try {
    const userId = req.userId || getIdFromJwt(req.cookies.SAT);
    if (!userId) {
      return res.status(401).json({ message: "Token Expired or Invalid" });
    }

    const orderKey = req.query.orderKey || "createdAt";
    const orderType = req.query.orderType === "asc" ? 1 : -1;
    const pageIndex = parseInt(req.query.pageIndex) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const tab = req.query.tab || "all";
    const skip = pageIndex * pageSize;

    let pipeline = [{ $match: { sellerId: userId } }];

    if (tab === "Unpublished") {
      pipeline = [
        {
          $match: {
            sellerId: userId,
            status: { $in: ["Unpublished", "Pending"] },
          },
        },
      ];
    } else if (tab && tab !== "all") {
      pipeline = [
        {
          $match: {
            sellerId: userId,
            status: tab,
          },
        },
      ];
    }

    if (orderKey === "price" || orderKey === "stock") {
      pipeline.push({
        $addFields: {
          averagePrice: { $avg: "$options.price" },
          totalInStock: { $sum: "$options.inStock" },
        },
      });
    }

    if (orderKey === "name") {
      pipeline.push({ $sort: { name: orderType } });
    } else if (orderKey === "price") {
      pipeline.push({ $sort: { averagePrice: orderType } });
    } else if (orderKey === "stock") {
      pipeline.push({ $sort: { totalInStock: orderType } });
    } else {
      pipeline.push({ $sort: { createdAt: orderType } });
    }

    pipeline.push({ $skip: skip }, { $limit: pageSize });

    const products = await Product.aggregate(pipeline).exec();

    let totalProducts = 0;
    if (tab === "all") {
      totalProducts = await Product.countDocuments({
        sellerId: userId,
      }).exec();
    } else if (tab === "Unpublished") {
      totalProducts = await Product.countDocuments({
        sellerId: userId,
        status: { $in: ["Unpublished", "Pending"] },
      }).exec();
    } else if (tab) {
      totalProducts = await Product.countDocuments({
        sellerId: userId,
        status: tab,
      }).exec();
    }

    res.status(200).json({
      products,
      totalPages: Math.ceil(totalProducts / pageSize),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/search", async (req, res) => {
  try {
    const {
      keyword,
      pageIndex = 0,
      pageSize = 12,
      orderKey = "createdAt",
      orderType = "desc",
      minPrice,
      maxPrice,
    } = req.query;

    const skip = parseInt(pageIndex) * parseInt(pageSize);

    // Xây dựng query cơ bản
    let searchQuery = { status: "Published" };

    // Tìm kiếm theo tên (ưu tiên)
    if (keyword) {
      searchQuery.name = { $regex: keyword, $options: "i" };
    }

    // Thêm điều kiện lọc giá nếu có
    if (minPrice || maxPrice) {
      searchQuery["options.price"] = {};
      if (minPrice) searchQuery["options.price"].$gte = parseFloat(minPrice);
      if (maxPrice) searchQuery["options.price"].$lte = parseFloat(maxPrice);
    }

    // Thực hiện truy vấn
    const products = await Product.aggregate([
      { $match: searchQuery },
      {
        $project: {
          _id: 1,
          name: 1,
          promotionImage: 1,
          status: 1,
          createdAt: 1,
          options: 1,
          numberOfOptions: { $size: "$options" },
          price: {
            $cond: {
              if: { $gt: [{ $size: "$options" }, 1] },
              then: {
                min: { $min: "$options.price" },
                max: { $max: "$options.price" },
              },
              else: { $arrayElemAt: ["$options.price", 0] },
            },
          },
        },
      },
      { $sort: { [orderKey]: orderType === "asc" ? 1 : -1 } },
      { $skip: skip },
      { $limit: parseInt(pageSize) },
    ]);

    // Đếm tổng số sản phẩm để phân trang
    const totalProducts = await Product.countDocuments(searchQuery);

    console.log("Search results:", {
      productsCount: products.length,
      totalPages: Math.ceil(totalProducts / parseInt(pageSize)),
    });

    res.status(200).json({
      products,
      totalPages: Math.ceil(totalProducts / parseInt(pageSize)),
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});
router.post(
  "/add",
  authMiddleware,
  renewToken,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "promotionImage", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "optionImages", maxCount: 50 },
  ]),
  async (req, res) => {
    try {
      const { files, body } = req;
      // CREATE PRODUCT
      const userId = req.userId || getIdFromJwt(req.cookies.SAT);
      if (!userId) {
        res.send("Token Expire").status(401);
      }
      const name = body.name;
      const category = body.category;
      const description = body.description;
      const ratio = body.ratio;
      const newProduct = new Product({
        sellerId: userId,
        name,
        category,
        description,
        ratio,
      });
      const product = await newProduct.save();
      //upload Image
      const productId = product.id;
      const bucketName = "ipain-product";
      const bucketFolder = "product";
      const optionImagesIndex = body.optionImagesIndex;
      const promotionImage = files["promotionImage"]
        ? files["promotionImage"][0]
        : null;
      const productImages = files["images"] || [];
      const optionImages = files["optionImages"] || [];
      const uploadImageResponse = await UploadProductImages(
        userId,
        productId,
        bucketName,
        bucketFolder,
        promotionImage,
        productImages,
        optionImages
      );
      const updateFields = {};

      //update URL Image for product
      // console.log("RESPONSE", uploadImageResponse);
      const options = body.options;
      const optionImageUrls = uploadImageResponse.optionImageUrls;
      const productImageUrls = uploadImageResponse.productImageUrls;
      const promotionImageUrl = uploadImageResponse.promotionImageUrl;
      // console.log(optionImageUrls);
      let variations2Length = parseInt(body.variations2Length.trim(), 10);
      if (variations2Length > 1) {
        variations2Length -= 1;
      }
      if (optionImagesIndex) {
        const validIndexes = optionImagesIndex
          .map(Number)
          .filter((index) => !isNaN(index))
          .map((index) => index * variations2Length);
        const updatedOptions = options.map((option, index) => {
          if (validIndexes.includes(index)) {
            const imageUrl = optionImageUrls[validIndexes.indexOf(index)];
            return { ...option, image: process.env.CLOUDFRONT_HOST + imageUrl };
          }
          return option;
        });
        //update image url element
        const groupedOptions = {};

        updatedOptions.forEach((option) => {
          if (!groupedOptions[option.value1]) {
            groupedOptions[option.value1] = [];
          }
          groupedOptions[option.value1].push(option);
        });

        Object.values(groupedOptions).forEach((group) => {
          const imageUrl = group.find((option) => option.image)?.image;
          if (imageUrl) {
            group.forEach((option) => {
              option.image = imageUrl;
            });
          }
        });
        if (updatedOptions.length > 0) updateFields.options = updatedOptions;
      } else if (options.length === 1 && options[0].type1 === "undefined") {
        updateFields.options = options;
        console.log("Option Update");
      }
      console.log(options);

      if (productImageUrls.length > 0) {
        const updatedProductImageUrls = productImageUrls.map(
          (url) => process.env.CLOUDFRONT_HOST + url
        );
        updateFields.images = updatedProductImageUrls;
      }
      if (promotionImageUrl)
        updateFields.promotionImage =
          process.env.CLOUDFRONT_HOST + promotionImageUrl;
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: updateFields },
        { new: true }
      );
      res.status(200).json({ message: "Product data received successfully" });
      const productValidateInformation = await getProductInfoToValidate(
        productId
      );
      if (getProductInfoToValidate) {
        validationProduct(productValidateInformation);
      }
    } catch (error) {
      console.error("Error receiving files:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
router.patch(
  "/:productId/restock",
  authMiddleware,
  renewToken,
  async (req, res) => {
    try {
      const userId = req.userId || getIdFromJwt(req.cookies.SAT);
      if (!userId) {
        return res.status(401).send("Token Expired");
      }

      const { productId } = req.params;
      const { options } = req.body;

      console.log(productId);

      const isProductValid = await isSellerOwnProduct(userId, productId);
      if (!isProductValid) {
        return res.status(403).send("You do not own this product");
      }

      const product = await Product.findById(productId).select("options");
      if (!product) {
        return res.status(404).send("Product not found");
      }

      const currentOptions = product.options;
      const optionsHaveChanged = options.some((newOption, index) => {
        const currentOption = currentOptions[index];
        return (
          newOption.type1 !== currentOption.type1 ||
          newOption.value1 !== currentOption.value1 ||
          newOption.type2 !== currentOption.type2 ||
          newOption.value2 !== currentOption.value2 ||
          newOption.price !== currentOption.price ||
          newOption.image !== currentOption.image ||
          newOption.inStock !== currentOption.inStock ||
          newOption.SKU !== currentOption.SKU
        );
      });

      if (optionsHaveChanged) {
        product.options = options;
        await product.save();
        return res.status(200).send("Product options updated successfully");
      }

      return res.status(200).send("No changes detected in product options");
    } catch (error) {
      console.error("Error in restocking product:", error);
      return res.status(500).send("Internal Server Error");
    }
  }
);
router.patch(
  "/:productId/sold-out",
  authMiddleware,
  renewToken,
  async (req, res) => {
    try {
      const userId = req.userId || getIdFromJwt(req.cookies.SAT);

      if (!userId) {
        return res.status(401).send("Token Expired");
      }

      const { productId } = req.params;
      console.log("Sold Out Action:");
      console.log(productId);
      const isProductValid = await isSellerOwnProduct(userId, productId);

      if (!isProductValid) {
        return res.status(403).send("You do not own this product");
      }

      const result = await Product.updateOne(
        { _id: productId },
        {
          $set: {
            "options.$[elem].inStock": 0,
          },
        },
        {
          arrayFilters: [{ "elem.inStock": { $ne: 0 } }],
          new: true,
        }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).send("No options updated or product not found");
      }

      return res.status(200).send("All options marked as out of stock");
    } catch (error) {
      console.error("Error updating product options:", error);
      return res.status(500).send("Internal Server Error");
    }
  }
);

router.patch(
  "/:productId/hidden",
  authMiddleware,
  renewToken,
  async (req, res) => {
    try {
      const userId = req.userId || getIdFromJwt(req.cookies.SAT);
      if (!userId) {
        return res.status(401).send("Token Expired");
      }
      const { productId } = req.params;
      console.log("Action: Hidden Product");
      console.log(productId);
      const isProductValid = await isSellerOwnProduct(userId, productId);
      if (!isProductValid) {
        return res.status(403).send("You do not own this product");
      }
      const result = await Product.findOneAndUpdate(
        { _id: productId, status: "Published" },
        { $set: { status: "Hidden" } }
      );
      if (!result) {
        return res
          .status(400)
          .send("Product is not in Published status or not found");
      }
      return res.status(200).send("Product status updated to Hidden");
    } catch (error) {
      console.error("Error updating product status:", error);
      return res.status(500).send("Internal Server Error");
    }
  }
);

//route for' Users

router.get("/offer", async (req, res) => {
  try {
    const publishedProducts = await Product.aggregate([
      { $match: { status: "Published" } },
      {
        $project: {
          name: 1,
          promotionImage: 1,
          minPrice: { $min: "$options.price" },
          maxPrice: { $max: "$options.price" },
          numberOfOptions: { $size: "$options" },
        },
      },
      {
        $project: {
          name: 1,
          promotionImage: 1,
          price: {
            $cond: {
              if: { $eq: ["$minPrice", "$maxPrice"] },
              then: "$minPrice",
              else: {
                min: "$minPrice",
                max: "$maxPrice",
              },
            },
          },
          numberOfOptions: 1,
        },
      },
    ]);

    res.status(200).json(publishedProducts);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm đã xuất bản:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const options = product.options;

    if (options && options.length > 0) {
      const prices = options.map((option) => option.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      product._doc.minPrice = minPrice;
      product._doc.maxPrice = maxPrice;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi lấy thông tin sản phẩm" });
  }
});
router.post(
  "/reconsideration",
  authMiddleware,
  renewToken,
  async (req, res) => {
    try {
      const { _id } = req.body;

      const updatedProduct = await Product.findByIdAndUpdate(
        _id,
        { status: "Pending" },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res
        .status(200)
        .json({ message: "Product status updated to Pending" });
    } catch (error) {
      console.error("Error updating product status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
