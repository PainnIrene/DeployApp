import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  username: { type: String, require: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String },
  avtUrl: { type: String },
  shopName: { type: String, default: "Unknow " },
  isEmailVerify: { type: Boolean, default: false },
  isPhoneNumberVerify: { type: Boolean, default: false },
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
  taxNumbers: { type: String },
});

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;
