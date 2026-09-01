import express from "express";
import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import { requireCustomer } from "../middleware/auth.js";

const router = express.Router();

// GET the logged-in customer's wishlist, populated with product data
router.get("/", requireCustomer, async (req, res) => {
  const customer = await Customer.findById(req.customerId).populate("wishlist");
  res.json(customer?.wishlist || []);
});

// Toggle a product in/out of the wishlist
router.post("/:productId", requireCustomer, async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const customer = await Customer.findById(req.customerId);
  const idx = customer.wishlist.findIndex((id) => id.toString() === productId);

  let added;
  if (idx > -1) {
    customer.wishlist.splice(idx, 1);
    added = false;
  } else {
    customer.wishlist.push(productId);
    added = true;
  }

  await customer.save();
  res.json({ added, wishlist: customer.wishlist });
});

export default router;
