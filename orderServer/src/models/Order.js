import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  items: [
    {
      productId: {
        type: String,
        required: true,
      },
      optionId: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      sellerId: {
        type: String,
        required: true,
      },
      productSnapshot: {
        name: String,
        image: String,
        value1: String,
        value2: String,
        type1: String,
        type2: String,
        price: Number,
      },
    },
  ],
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    province: String,
    district: String,
    ward: String,
  },
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"],
    default: "PENDING",
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingFee: {
    type: Number,
    default: 20000, // 20,000 VND shipping fee
  },
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  shippingDate: Date,
  completedDate: Date,
  cancelledDate: Date,
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  paymentDetails: {
    method: String,
    paymentId: String,
    paidAt: Date,
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
