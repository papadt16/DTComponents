import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    title: String,
    price: Number,
    qty: Number,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema({
  // Absent for guest checkouts — those still work, they just aren't
  // retrievable as account-linked history.
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  items: [OrderItemSchema],
  subtotal: Number,
  discountCode: String,
  discountAmount: { type: Number, default: 0 },
  total: Number,
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "completed", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", OrderSchema, "orders");
