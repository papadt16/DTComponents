import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  phone: String,
  address: String,
  city: String,
  state: String,
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Customer", CustomerSchema, "customers");
