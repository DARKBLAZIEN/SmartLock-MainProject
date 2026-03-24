const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // loads backend/.env from the current working directory

const http = require("http");
const { Server } = require("socket.io");

const rateLimit = require("express-rate-limit");
const apartmentRoutes = require("./routes/Accessroutes");
const adminRoutes = require("./routes/Adminroutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.set("io", io);

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



app.use("/api/apartment", apartmentRoutes);
app.use("/api/admin", adminRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("SmartLock backend running");
});

io.on("connection", (socket) => {
  console.log("Unity connected:", socket.id);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});