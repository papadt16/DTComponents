import express from "express";
import Promotion from "../models/Promotion.js";
import { requireAdmin } from "../middleware/auth.js";
import { isPromoValidNow, computeDiscount } from "../utils/promotions.js";

const router = express.Router();

// ---------------------------
// PUBLIC: currently valid featured promo, for the homepage banner
// ---------------------------
router.get("/featured", async (req, res) => {
  const promos = await Promotion.find({ active: true, featured: true });
  const valid = promos.find(isPromoValidNow);
  res.json(valid || null);
});

// ---------------------------
// PUBLIC: validate a code against a cart total (used at checkout)
// ---------------------------
router.post("/validate", async (req, res) => {
  const { code, cartTotal } = req.body || {};
  if (!code) return res.status(400).json({ error: "Enter a promo code" });

  const promo = await Promotion.findOne({ code: String(code).toUpperCase().trim() });
  if (!promo || !isPromoValidNow(promo)) {
    return res.status(400).json({ error: "That code is invalid or has expired" });
  }
  if (Number(cartTotal) < (promo.minOrderTotal || 0)) {
    return res.status(400).json({
      error: `This code needs a minimum order of ₦${promo.minOrderTotal.toLocaleString()}`,
    });
  }

  const discountAmount = computeDiscount(promo, Number(cartTotal));
  res.json({
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discountAmount,
  });
});

// ---------------------------
// ADMIN: list all promotions
// ---------------------------
router.get("/", requireAdmin, async (req, res) => {
  const promos = await Promotion.find().sort({ createdAt: -1 });
  res.json(promos);
});

// ---------------------------
// ADMIN: create
// ---------------------------
router.post("/", requireAdmin, async (req, res) => {
  try {
    const promo = await Promotion.create({
      ...req.body,
      code: String(req.body.code || "").toUpperCase().trim(),
    });
    res.json(promo);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "A promotion with that code already exists" });
    }
    res.status(400).json({ error: err.toString() });
  }
});

// ---------------------------
// ADMIN: update (edit fields or toggle active/featured)
// ---------------------------
router.put("/:id", requireAdmin, async (req, res) => {
  const update = { ...req.body };
  if (update.code) update.code = String(update.code).toUpperCase().trim();

  const promo = await Promotion.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!promo) return res.status(404).json({ error: "Promotion not found" });
  res.json(promo);
});

// ---------------------------
// ADMIN: delete
// ---------------------------
router.delete("/:id", requireAdmin, async (req, res) => {
  await Promotion.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
