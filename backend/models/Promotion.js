import mongoose from "mongoose";

const PromotionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: String,
  discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
  discountValue: { type: Number, required: true },
  minOrderTotal: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  active: { type: Boolean, default: true },
  usageLimit: { type: Number, default: 0 }, // 0 = unlimited
  usedCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }, // shown as the homepage banner when valid
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Promotion", PromotionSchema, "promotions");
