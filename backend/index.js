const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // loads backend/.env from the current working directory

const rateLimit = require("express-rate-limit");
const apartmentRoutes = require("./routes/Accessroutes");
const adminRoutes = require("./routes/Adminroutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- Global Rate Limiter (applied to all routes) ---
// 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use(globalLimiter);

// --- OTP Brute-Force Protection ---
// Strict limiter on the pickup endpoint: max 5 attempts per 15 minutes per IP.
// Prevents exhaustive 6-digit OTP guessing (1,000,000 combinations).
const pickupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // lock after 5 attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many failed pickup attempts. Please try again in 15 minutes." },
});
app.use("/api/apartment/pickup", pickupLimiter);



// Routes
app.use("/api/apartment", apartmentRoutes);
app.use("/api/admin", adminRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("SmartLock backend running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
