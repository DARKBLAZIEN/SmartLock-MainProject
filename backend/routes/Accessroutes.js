const express = require("express");
const nodemailer = require("nodemailer");
const Apartment = require("../models/Apartment");
const Locker = require("../models/Locker");
const DeliveryLog = require("../models/DeliveryLog");
const RegistrationOTP = require("../models/RegistrationOTP");

const router = express.Router();

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Get all apartments
router.get("/", async (req, res) => {
  try {
    const apartments = await Apartment.find();
    res.status(200).json(apartments);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- LOCKER MANAGEMENT ---

// Get all lockers
router.get("/lockers", async (req, res) => {
  try {
    const lockers = await Locker.find();
    res.status(200).json(lockers);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add a new locker
router.post("/locker", async (req, res) => {
  try {
    const { lockerId } = req.body;
    const newLocker = new Locker({ lockerId, isFree: true });
    await newLocker.save();
    res.status(201).json({ success: true, message: "Locker added" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error or duplicate ID" });
  }
});

// Update Locker Status (Reset)
router.put("/locker/reset", async (req, res) => {
  try {
    const { lockerId } = req.body;
    const locker = await Locker.findOne({ lockerId });
    if (!locker) return res.status(404).json({ success: false });

    locker.isFree = true;
    await locker.save();
    res.status(200).json({ success: true, message: "Locker reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Send OTP for Register
router.post("/register-otp", async (req, res) => {
  try {
    const { gmail } = req.body;
    if (!gmail) return res.status(400).json({ success: false, message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await RegistrationOTP.findOneAndUpdate(
      { gmail: gmail.toLowerCase() },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: gmail,
      subject: "Registration OTP for SmartLock",
      text: `Your OTP for resident registration is: ${otp}. This code will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Register OTP] Sent to ${gmail}: ${otp}`);

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Register OTP error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// Register Apartment
router.post("/register", async (req, res) => {
  try {
    console.log("Register Request Body:", req.body);
    const { apartmentId, nameOfOwner, gmail, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP is required" });
    }

    const otpRecord = await RegistrationOTP.findOne({ gmail: gmail.toLowerCase() });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const existing = await Apartment.findOne({ apartmentId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Apartment ID already exists" });
    }

    const newApartment = new Apartment({
      apartmentId,
      nameOfOwner,
      gmail,
    });

    await newApartment.save();

    await RegistrationOTP.deleteOne({ gmail: gmail.toLowerCase() });

    res.status(201).json({ success: true, message: "Resident added successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/delivery", async (req, res) => {
  try {
    const { apartmentId } = req.body;
    console.log(`[Delivery] Request for Apt: ${apartmentId}`);

    const apartment = await Apartment.findOne({ apartmentId });
    if (!apartment) {
      return res.status(404).json({ success: false, message: "Apartment not found" });
    }

    const freeLocker = await Locker.findOne({ isFree: true });
    if (!freeLocker) {
      return res.status(400).json({ success: false, message: "No lockers available" });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const newLog = new DeliveryLog({
      apartmentId: apartment.apartmentId,
      lockerId: freeLocker.lockerId,
      otp: generatedOtp,
    });

    await newLog.save();

    freeLocker.isFree = false;
    await freeLocker.save();

    const io = req.app.get("io");

    io.emit("openLocker", {
      lockerId: freeLocker.lockerId
    });

    // AUTO CLOSE AFTER 5 SECONDS
    setTimeout(() => {
      io.emit("closeLocker", {
        lockerId: freeLocker.lockerId
      });
    }, 5000);

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: apartment.gmail,
        subject: "Package Delivery Notification",
        text: `Hello ${apartment.nameOfOwner}, a delivery has been placed in locker ${freeLocker.lockerId}. Your OTP is: ${generatedOtp}`,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email failed:", emailError.message);
    }

    return res.status(200).json({
      success: true,
      nameOfOwner: apartment.nameOfOwner,
      lockerId: freeLocker.lockerId
    });

  } catch (error) {
    console.error("Delivery error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const PickupLog = require("../models/PickupLog");

router.post("/pickup", async (req, res) => {
  try {
    const { apartmentId, passcode } = req.body;

    const activeDelivery = await DeliveryLog.findOne({
      apartmentId,
      otp: passcode,
      isPickedUp: false
    });

    if (!activeDelivery) {
      return res.status(401).json({
        success: false,
        message: "Invalid Apartment ID or Passcode"
      });
    }

    activeDelivery.isPickedUp = true;
    await activeDelivery.save();

    await Locker.findOneAndUpdate(
      { lockerId: activeDelivery.lockerId },
      { isFree: true }
    );

    const io = req.app.get("io");

    io.emit("openLocker", {
      lockerId: activeDelivery.lockerId
    });

    setTimeout(() => {
      io.emit("closeLocker", {
        lockerId: activeDelivery.lockerId
      });
    }, 5000);

    const history = new PickupLog({
      apartmentId: activeDelivery.apartmentId,
      lockerId: activeDelivery.lockerId,
    });

    await history.save();

    const apartment = await Apartment.findOne({ apartmentId });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: apartment.gmail,
      subject: "Package Collected",
      text: `Hello ${apartment.nameOfOwner}, your package in locker ${activeDelivery.lockerId} has been successfully collected.`
    });

    return res.status(200).json({
      success: true,
      message: "Locker Unlocked! Please collect your package."
    });

  } catch (error) {
    console.error("Pickup error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;