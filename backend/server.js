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

// ---------------------------
// CONFIG
// ---------------------------
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "DT_SECRET_123";

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
// PRODUCT SCHEMA
// ---------------------------
const ProductSchema = new mongoose.Schema({
  title: String,
  sku: String,
  category: String,
  price: Number,
  img: String,
  description: String,
});

const Product = mongoose.model("product", ProductSchema, "dtcomponents");

// ---------------------------
// ADMIN (single user account)
// ---------------------------
const admin = {
  username: "admin",
  passwordHash: bcrypt.hashSync("admin123", 10), // default password
};

// ---------------------------
// AUTH MIDDLEWARE
// ---------------------------
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") throw new Error();
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

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
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (username !== admin.username) {
    return res.status(400).json({ error: "Wrong username" });
  }

  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
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

    for (let item of jsonList) {
      await Product.create(item);
    }

    res.json({ success: true, count: jsonList.length });
  } catch (err) {
    res.status(400).json({ error: err.toString() });
  }
});

// ---------------------------
// START SERVER
// ---------------------------
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));



