import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Kiểm tra admin tồn tại
adminSchema.statics.isFirstAdmin = async function () {
  const count = await this.countDocuments();
  return count === 0;
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
