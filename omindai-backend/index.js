// index.js
require("dotenv").config(); // Load .env variables early
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const audioRoutes = require("./routes/audioRoutes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());

app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:5173", // frontend origin
  credentials: true, // allow credentials (cookies)
};

app.use(cors(corsOptions));
// MongoDB connection using URI from env
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Health check endpoint
app.get("/", (req, res) => res.send("Backend server is running"));

// Mount your routers under /api path prefix
app.use("/api", authRoutes);
app.use("/api", audioRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
