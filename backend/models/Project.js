const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  overview: String,
  features: [String],
  components: [String],
  schematic: String,
  code: String,
  explanation: [String],
  difficulty: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Project", ProjectSchema);
