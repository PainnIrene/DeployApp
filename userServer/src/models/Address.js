import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  province: {
    code: { type: String, required: true },
    name: { type: String, required: true },
  },
  district: {
    code: { type: String, required: true },
    name: { type: String, required: true },
  },
  ward: {
    code: { type: String, required: true },
    name: { type: String, required: true },
  },
  street: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  note: { type: String, required: false },
  default: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

addressSchema.pre("save", async function (next) {
  if (this.default) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { default: false } }
    );
  }
  next();
});

addressSchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  async function (next) {
    const update = this.getUpdate();
    if (update.$set && update.$set.default === true) {
      await this.model.updateMany(
        { user: this._conditions.user, _id: { $ne: this._conditions._id } },
        { $set: { default: false } }
      );
    }
    next();
  }
);

const Address = mongoose.model("Address", addressSchema);
export default Address;
