// DTComponents Backend Server
// Express + MongoDB + Cloudinary + JWT Admin Panel

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import csv from "csvtojson";
import streamifier from "streamifier";
import cloudinary from "cloudinary";
import projectsRoutes from "./routes/projects.js"; // include .js extension
import authRoutes from "./routes/auth.js";
import wishlistRoutes from "./routes/wishlist.js";
import ordersRoutes from "./routes/orders.js";
import promotionsRoutes from "./routes/promotions.js";
import { requireAdmin } from "./middleware/auth.js";
import Product from "./models/Product.js";

// ---------------------------
// CONFIG
// ---------------------------
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // generate with: node scripts/hash-password.js "yourpassword"

// Fail loudly instead of silently running with weak/guessable defaults.
if (!JWT_SECRET || !ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
  console.error(
    "Missing required env vars: JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD_HASH.\n" +
    "Set these in your hosting provider's environment settings (e.g. Render dashboard) before starting the server.\n" +
    "Run `node scripts/hash-password.js \"yourpassword\"` locally to generate ADMIN_PASSWORD_HASH."
  );
  process.exit(1);
}

// ---------------------------
// CLOUDINARY CONFIG
// ---------------------------
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || ""
});

// ---------------------------
// MONGODB CONNECTION
// ---------------------------
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dtcomponents")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ---------------------------
// PRODUCT MODEL — see ./models/Product.js
// ---------------------------

// ---------------------------
// ADMIN (single user account, credentials from env)
// ---------------------------
const admin = {
  username: ADMIN_USERNAME,
  passwordHash: ADMIN_PASSWORD_HASH,
};

// ---------------------------
// LOGIN RATE LIMITING (basic in-memory brute-force protection)
// ---------------------------
const loginAttempts = new Map(); // ip -> { count, resetAt }
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function rateLimitLogin(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const minutesLeft = Math.ceil((entry.resetAt - now) / 60000);
    return res.status(429).json({
      error: `Too many login attempts. Try again in ${minutesLeft} minute(s).`,
    });
  }

  entry.count += 1;
  next();
}

// requireAdmin is imported from ./middleware/auth.js (shared with routes/projects.js)

// ---------------------------
// ROUTES
// ---------------------------

// TEST route
app.get("/", (req, res) => {
  res.send("DTComponents Backend Running");
});

// ---------------------------
// ADMIN LOGIN
// ---------------------------
app.post("/admin/login", rateLimitLogin, async (req, res) => {
  const { username, password } = req.body || {};

  // Always run bcrypt.compare even on a wrong username, so response
  // timing doesn't leak whether the username was correct.
  const match = await bcrypt.compare(password || "", admin.passwordHash);

  if (username !== admin.username || !match) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "12h" });
  res.json({ token });
});

// ---------------------------
// GET ALL PRODUCTS
// ---------------------------
app.get("/products", async (req, res) => {
  const { search, category } = req.query;

  let filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  if (category && category !== "All") {
    filter.category = category;
  }

  const products = await Product.find(filter);
  res.json(products);
});

// ---------------------------
// ADD PRODUCT
// ---------------------------
app.post("/products", requireAdmin, async (req, res) => {
  const doc = await Product.create(req.body);
  res.json(doc);
});

// ---------------------------
// UPDATE PRODUCT
// ---------------------------
app.put("/products/:id", requireAdmin, async (req, res) => {
  const doc = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(doc);
});

// ---------------------------
// GET SINGLE PRODUCT
// ---------------------------
app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------------
// DELETE PRODUCT
// ---------------------------
app.delete("/products/:id", requireAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ---------------------------
// IMAGE UPLOAD (Cloudinary)
// ---------------------------
const upload = multer();

app.post("/upload", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder: "dtcomponents_products" },
      (err, result) => {
        if (err) return res.status(400).json({ error: err });
        res.json({ url: result.secure_url });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// CSV IMPORT (bulk products)
// ---------------------------
app.post("/products/import", requireAdmin, upload.single("file"), async (req, res) => {
  try {
    const csvString = req.file.buffer.toString();
    const jsonList = await csv().fromString(csvString);

    const normalized = jsonList.map((item) => ({
      ...item,
      price: Number(item.price) || 0,
      stock: Number(item.stock) || 0,
    }));

    await Product.insertMany(normalized);

    res.json({ success: true, count: normalized.length });
  } catch (err) {
    res.status(400).json({ error: err.toString() });
  }
});

app.use("/projects", projectsRoutes);
app.use("/auth", authRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/orders", ordersRoutes);
app.use("/promotions", promotionsRoutes);


// ---------------------------
// START SERVER
// ---------------------------
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));








