import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    type1: { type: String }, // size
    value1: { type: String }, // S, M, L, etc
    type2: { type: String }, // color
    value2: { type: String }, // black, blue, etc
    price: { type: Number },
    image: { type: String },
    inStock: { type: Number },
    SKU: { type: String },
  },
  { _id: true }
); // _id is automatically added, but you can explicitly specify it

const productSchema = new mongoose.Schema({
  sellerId: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  promotionImage: { type: String },
  ratio: { type: String },
  video: { type: String },
  images: [{ type: String }],
  brand: { type: String },
  condition: { type: String },
  preOrder: { type: Number },
  status: { type: String, default: "Unpublished" }, // Unpublished, Violation, Published, Hidden.Refer
  options: [optionSchema], // Embedding the optionSchema
});

const Product = mongoose.model("Product", productSchema);
export default Product;
