const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema({
  filename: String,
  filepath: String,
  uploadDate: { type: Date, default: Date.now }, // when audio was uploaded
  transcript: String,
  transcribedAt: { type: Date }, // when transcript was generated
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Audio", audioSchema);
