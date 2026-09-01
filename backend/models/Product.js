import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: String,
  sku: String,
  category: { type: String, index: true },
  price: Number,
  stock: { type: Number, default: 0 },
  img: String,

  description: {
    overview: String,
    features: [String],
    applications: [String],
    specifications: {
      type: Map,
      of: String,
    },
  },
});

export default mongoose.model("Product", ProductSchema, "products");
