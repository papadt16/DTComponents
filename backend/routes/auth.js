import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import { requireCustomer, JWT_SECRET } from "../middleware/auth.js";

const router = express.Router();

// ---------------------------
// Basic in-memory rate limiting (mirrors the admin login protection)
// ---------------------------
const attempts = new Map();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

function rateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const minutesLeft = Math.ceil((entry.resetAt - now) / 60000);
    return res.status(429).json({ error: `Too many attempts. Try again in ${minutesLeft} minute(s).` });
  }

  entry.count += 1;
  next();
}

router.post("/register", rateLimit, async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await Customer.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const customer = await Customer.create({ name, email: normalizedEmail, passwordHash });

  const token = jwt.sign({ role: "customer", id: customer._id }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, name: customer.name, email: customer.email });
});

router.post("/login", rateLimit, async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = (email || "").toLowerCase().trim();
  const customer = await Customer.findOne({ email: normalizedEmail });

  if (!customer) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const match = await bcrypt.compare(password || "", customer.passwordHash);
  if (!match) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ role: "customer", id: customer._id }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, name: customer.name, email: customer.email });
});

router.get("/me", requireCustomer, async (req, res) => {
  const customer = await Customer.findById(req.customerId).select("-passwordHash");
  if (!customer) return res.status(404).json({ error: "Account not found" });
  res.json(customer);
});

export default router;
