import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, require: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumbers: { type: String },
  avtUrl: { type: String },
  name: { type: String },
  gender: { type: String },
  dateOfBirth: { type: String },
  isEmailVerify: { type: Boolean, default: false },
  isPhoneNumberVerify: { type: Boolean, default: false },
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
});

const User = mongoose.model("User", userSchema);
export default User;
