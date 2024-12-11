import mongoose from "mongoose";
import Seller from "./Seller.js";
const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  // selectedOption: {
  //   // type1: { type: String },
  //   // value1: { type: String },
  //   // type2: { type: String },
  //   // value2: { type: String },
  //   // price: { type: Number },
  //   // SKU: { type: String },
  // },
  optionId: { type: String },

  updatedAt: { type: Date, default: Date.now },
  // productName: { type: String, required: true },
  // promotionImage: { type: String },
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [cartItemSchema],
});

cartSchema.statics.getNumberOfItems = async function (userId) {
  const result = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $project: { itemCount: { $size: "$items" } } },
  ]);
  return result[0]?.itemCount || 0;
};

cartSchema.methods.getGroupedItemsBySeller = function () {
  const sortedItems = this.items.sort((a, b) => b.updatedAt - a.updatedAt);

  const groupedItems = sortedItems.reduce((acc, item) => {
    if (!acc[item.sellerId]) {
      acc[item.sellerId] = {
        sellerId: item.sellerId,
        items: [],
      };
    }
    acc[item.sellerId].items.push(item);
    return acc;
  }, {});

  return Object.values(groupedItems);
};

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
