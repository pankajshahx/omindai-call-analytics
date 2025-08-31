const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const audioController = require("../controllers/audioController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname
      .replace(/\s+/g, "_")          // replace spaces with _
      .replace(/[^a-zA-Z0-9_\-\.]/g, ""); // remove invalid characters
    const uniqueName = `${safeName}-${timestamp}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });


// Routes with authentication middleware

// Upload and transcribe audios (max 5 files), protected
router.post(
  "/upload",
  authenticate,
  upload.array("audios", 5),
  audioController.uploadAndTranscribe
);

// Analyze transcript by audioId, protected
router.post(
  "/analyze/:audioId",
  authenticate,
  audioController.analyzeTranscript
);

// Get all audios with analysis, protected
router.get("/all", authenticate, audioController.getAllAudioAnalysis);

module.exports = router;
