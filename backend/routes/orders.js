import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Promotion from "../models/Promotion.js";
import { requireCustomer, requireAdmin, JWT_SECRET } from "../middleware/auth.js";
import { isPromoValidNow, computeDiscount } from "../utils/promotions.js";

const router = express.Router();

// Attaches req.customerId when a valid customer token is present, but
// never rejects the request — guest checkout must keep working.
function optionalCustomer(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === "customer") req.customerId = decoded.id;
  } catch {
    // invalid/expired token — proceed as guest rather than failing checkout
  }
  next();
}

// ---------------------------
// CREATE ORDER (customer or guest)
// ---------------------------
router.post("/", optionalCustomer, async (req, res) => {
  const { items, discountCode } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order must include at least one item" });
  }

  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.qty), 0);

  // Discount is always recalculated server-side from the stored promo —
  // a client-supplied discount amount is never trusted.
  let discountAmount = 0;
  let appliedPromo = null;

  if (discountCode) {
    const promo = await Promotion.findOne({ code: String(discountCode).toUpperCase().trim() });
    if (promo && isPromoValidNow(promo) && subtotal >= (promo.minOrderTotal || 0)) {
      discountAmount = computeDiscount(promo, subtotal);
      appliedPromo = promo;
    }
  }

  const total = Math.max(0, subtotal - discountAmount);

  const order = await Order.create({
    customer: req.customerId || undefined,
    items: items.map((i) => ({ product: i._id, title: i.title, price: i.price, qty: i.qty })),
    subtotal,
    discountCode: appliedPromo?.code,
    discountAmount,
    total,
  });

  if (appliedPromo) {
    appliedPromo.usedCount += 1;
    await appliedPromo.save();
  }

  // Best-effort stock decrement — floor at 0, skip items that no longer
  // exist rather than failing the whole order.
  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item._id)) continue;
    const product = await Product.findById(item._id);
    if (product) {
      product.stock = Math.max(0, (product.stock || 0) - Number(item.qty));
      await product.save();
    }
  }

  res.json(order);
});

// ---------------------------
// ADMIN: list all orders (must come before the "/:id" route below)
// ---------------------------
router.get("/admin/all", requireAdmin, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate("customer", "name email");
  res.json(orders);
});

// ---------------------------
// ADMIN: update order status
// ---------------------------
router.put("/admin/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  const allowed = ["pending", "confirmed", "shipped", "completed", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(", ")}` });
  }

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

// ---------------------------
// CUSTOMER: own order history
// ---------------------------
router.get("/", requireCustomer, async (req, res) => {
  const orders = await Order.find({ customer: req.customerId }).sort({ createdAt: -1 });
  res.json(orders);
});

// ---------------------------
// CUSTOMER: single order (must belong to them)
// ---------------------------
router.get("/:id", requireCustomer, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }
  const order = await Order.findOne({ _id: req.params.id, customer: req.customerId });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

export default router;
