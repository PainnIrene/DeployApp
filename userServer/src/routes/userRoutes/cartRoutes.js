import express from "express";
import authMiddleware from "../../middlewares/User/jwt.js";
import renewToken from "../../middlewares/User/renewToken.js";
import {
  getProductOptionById, //get stock
  getOptionInfoById, //get part of info real time price,name,etc
  getDetailsOptionInfoById, //get details option info real time
} from "../../services/product.js";
import Cart from "../../models/Cart.js";
import { getIdFromJwt } from "../../utils/jwt.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/recentAdded", authMiddleware, renewToken, async (req, res) => {
  try {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    const itemCount = await Cart.getNumberOfItems(userId);

    if (itemCount === 0) {
      return res.status(200).json({
        recentItems: [],
        numberOfItems: 0,
      });
    }

    const [cart] = await Cart.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$items" },
      { $sort: { "items.updatedAt": -1 } },
      { $limit: 5 },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          items: { $push: "$items" },
        },
      },
    ]);

    if (!cart) {
      return res.status(200).json({
        recentItems: [],
        numberOfItems: 0,
      });
    }

    const mergeItems = await Promise.all(
      cart.items.map(async (item) => {
        const productInfo = await getOptionInfoById(item.optionId);
        return { ...item, ...productInfo };
      })
    );

    res.status(200).json({
      recentItems: mergeItems,
      numberOfItems: itemCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
      recentItems: [],
      numberOfItems: 0,
    });
  }
});

router.post("/add", authMiddleware, renewToken, async (req, res) => {
  const userId = req.userId || getIdFromJwt(req.cookies.AT);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { productId, quantity, value1, value2 } = req.body;

    // 1. Lấy thông tin sản phẩm từ Product Service
    const productInStock = await getProductOptionById(
      productId,
      value1,
      value2
    );
    if (
      !productInStock.inStock ||
      !productInStock._id ||
      !productInStock.sellerId
    ) {
      return res.status(404).json({ error: "Product or option not found" });
    }
    console.log(productInStock);
    // 2. Lấy giỏ hàng hiện tại của người dùng
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // 3. Kiểm tra xem sản phẩm và option đã tồn tại trong giỏ hàng chưa
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId === productId && item.optionId === productInStock._id
    );

    let newQuantity;
    if (existingItemIndex > -1) {
      // Sản phẩm và tùy chọn đã tồn tại, cập nhật số lượng
      newQuantity = cart.items[existingItemIndex].quantity + quantity;

      // Kiểm tra số lượng tồn kho
      if (newQuantity > productInStock.inStock) {
        return res.status(400).json({
          error: "You already added maximum quantity of product in stock",
          availableStock: productInStock.inStock,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].updatedAt = new Date();
    } else {
      // Sản phẩm và tùy chọn chưa tồn tại, thêm mới
      if (quantity > productInStock.inStock) {
        return res.status(400).json({
          error: "You already added maximum quantity of product in stock",
          availableStock: productInStock.inStock,
        });
      }
      console.log("product In Stock", productInStock);
      cart.items.push({
        productId,
        quantity: quantity,
        optionId: productInStock._id,
        updateAt: new Date(),
        sellerId: productInStock.sellerId,
      });
    }
    // 6. Lưu giỏ hàng
    await cart.save();
    res.status(200).json({
      message: "Product added to cart successfully",
      cart: cart.items,
    });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({
      message: "An error occurred while adding the product to cart",
    });
  }
});

router.get("/all", authMiddleware, renewToken, async (req, res) => {
  try {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.sellerId",
      select: "shopName",
    });
    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    const groupedItems = await cart.getGroupedItemsBySeller();
    await Promise.all(
      groupedItems.map(async (group) => {
        // Lặp qua từng nhóm (sellerId)
        const itemsWithProductInfo = await Promise.all(
          group.items.map(async (item) => {
            // Lặp qua từng item trong nhóm và lấy productInfo
            const productInfo = await getDetailsOptionInfoById(item.optionId);
            return { ...item._doc, ...productInfo }; // Gộp thông tin sản phẩm vào item
          })
        );
        // Cập nhật lại danh sách items trong group sau khi đã merge thông tin sản phẩm
        group.items = itemsWithProductInfo;
      })
    );
    res.status(200).json(groupedItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).send({ message: "Server error" });
  }
});
router.get("/listall", authMiddleware, renewToken, async (req, res) => {
  try {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    const cart = await Cart.findOne({ userId: userId }).populate({
      path: "items.sellerId",
      select: "shopName",
      as: "seller",
    });

    // Nếu không tìm thấy cart
    if (!cart) {
      return res.status(404).send({ error: "Cart not found" });
    }
    const updatedGroupedItems = await Promise.all(
      groupedItems.map(async (group) => {
        const updatedItems = await Promise.all(
          group.items.map(async (item) => {
            const productInfo = await getOptionInfoById(item.optionId);
            return { ...item._doc, ...productInfo }; // Gộp productInfo vào item
          })
        );
        // Trả về group với các items đã được cập nhật
        return { ...group, items: updatedItems };
      })
    );

    res.status(200).send(updatedGroupedItems);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.post("/updatequantity", authMiddleware, renewToken, async (req, res) => {
  try {
    // Lấy userId từ middleware hoặc JWT
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    const { productId, value1, value2, updateQuantity } = req.body;

    console.log("Input values:", { productId, value1, value2, updateQuantity });
    // Bước 1: Lấy instock hiện tại của sản phẩm
    let productDetails = "";
    if (value1 === "" && value2 === "") {
      productDetails = await getProductOptionById(
        productId,
        "undefined",
        "undefined"
      );
    } else {
      productDetails = await getProductOptionById(productId, value1, value2);
    }

    if (!productDetails || productDetails.inStock === undefined) {
      return res.status(400).send({ message: "Product Not Found" });
    }

    const inStock = productDetails.inStock;

    // Kiểm tra số lượng yêu cầu có hợp lệ và không vượt quá tồn kho
    if (updateQuantity > inStock) {
      return res.status(400).send({
        message: `There are only ${inStock} quantity remaining for this item`,
      });
    }

    const optionId = productDetails._id;

    // Bước 2: Tìm item trong giỏ hàng của người dùng dựa trên productId và optionId
    const foundItem = await Cart.findOne(
      {
        userId: userId,
        items: {
          $elemMatch: {
            productId: productId,
            optionId: optionId,
          },
        },
      },
      { "items.$": 1 }
    );

    if (!foundItem) {
      return res.status(404).send({ message: "Can not found product in cart" });
    }

    // Bước 3: Xử lý cập nhật hoặc xóa sản phẩm trong giỏ hàng
    if (updateQuantity === 0) {
      // Xóa item nếu số lượng cập nhật là 0
      await Cart.updateOne(
        { _id: foundItem._id },
        { $pull: { items: { _id: foundItem.items[0]._id } } }
      );
      return res.status(200).send({ message: "Deleted product from cart" });
    } else {
      // Cập nhật số lượng sản phẩm nếu hợp lệ
      await Cart.updateOne(
        { "items._id": foundItem.items[0]._id },
        {
          $set: {
            "items.$.quantity": updateQuantity,
            "items.$.updatedAt": new Date(),
          },
        }
      );
      return res.status(200).send({ message: "Update quantity successful" });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    return res.status(500).send({ message: "Server Error" });
  }
});

export default router;
