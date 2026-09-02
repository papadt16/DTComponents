import express from "express";
import mongoose from "mongoose";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/* ================================
   PROJECT SCHEMA
================================ */
const ProjectSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  overview: String,
  features: [String],
  components: [String],
  schematic: String,
  image: String,
  difficulty: String,
  code: String,
  explanation: [
    {
      title: String,
      text: mongoose.Schema.Types.Mixed, // string or array of strings
      img: String,
    },
  ],
});

const Project = mongoose.model("Project", ProjectSchema, "projects");

/* ================================
   GET ALL PROJECTS
================================ */
router.get("/", async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

/* ================================
   GET PROJECT BY SLUG
================================ */
router.get("/:slug", async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug });
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  res.json(project);
});

/* ================================
   CREATE PROJECT
================================ */
router.post("/", requireAdmin, async (req, res) => {
  const project = await Project.create(req.body);
  res.json(project);
});

/* ================================
   UPDATE PROJECT
================================ */
router.put("/:id", requireAdmin, async (req, res) => {
  const updated = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

/* ================================
   DELETE PROJECT
================================ */
router.delete("/:id", requireAdmin, async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ================================
   ✅ REQUIRED FOR ES MODULES
================================ */
export default router;
