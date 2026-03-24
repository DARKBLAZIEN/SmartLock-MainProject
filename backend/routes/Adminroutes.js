const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

/**
 * POST /api/admin/login
 * Verify admin credentials and return a signed JWT.
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // Sign JWT — expires in 8 hours
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

/**
 * POST /api/admin/setup
 * One-time route to create the initial admin account.
 * REMOVE or protect this in production after first use!
 */
router.post("/setup", async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) {
      return res.status(403).json({ success: false, message: "Admin already exists. Use /login." });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    const admin = new Admin({ username: username.toLowerCase().trim(), password });
    await admin.save();

    res.status(201).json({ success: true, message: "Admin account created. You can now log in." });
  } catch (error) {
    console.error("Admin setup error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
