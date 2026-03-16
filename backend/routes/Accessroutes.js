const express = require("express");
const nodemailer = require("nodemailer");
const Apartment = require("../models/Apartment");
const Locker = require("../models/Locker");
const DeliveryLog = require("../models/DeliveryLog");
const RegistrationOTP = require("../models/RegistrationOTP");
const Event = require("../models/Event"); // Added from GitHub
const PickupLog = require("../models/PickupLog");
const Event = require("../models/Event");

const router = express.Router();

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- APARTMENT MANAGEMENT ---
router.get("/", async (req, res) => {
  try {
    const apartments = await Apartment.find();
    res.status(200).json(apartments);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- LOCKER MANAGEMENT ---
router.get("/lockers", async (req, res) => {
  try {
    const lockers = await Locker.find();
    res.status(200).json(lockers);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

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

router.put("/locker/reset", async (req, res) => {
  try {
    const { lockerId } = req.body;
    const locker = await Locker.findOne({ lockerId });
    if (!locker) return res.status(404).json({ success: false });

    locker.isFree = true;
    locker.isOpen = false; // GitHub logic
    await locker.save();

    // GitHub Event Logging
    await new Event({
      type: 'ADMIN_OVERRIDE',
      description: `Locker ${lockerId} manually reset by administrator`,
      lockerId: lockerId
    }).save();

    res.status(200).json({ success: true, message: "Locker reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- DELIVERY ROUTE (MERGED) ---
router.post("/delivery", async (req, res) => {
  try {
    const { apartmentId } = req.body;
    const apartment = await Apartment.findOne({ apartmentId });
    if (!apartment) return res.status(404).json({ success: false, message: "Apartment not found" });

    const freeLocker = await Locker.findOne({ isFree: true });
    if (!freeLocker) return res.status(400).json({ success: false, message: "No lockers available" });

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const newLog = new DeliveryLog({
      apartmentId: apartment.apartmentId,
      lockerId: freeLocker.lockerId,
      otp: generatedOtp,
    });
    await newLog.save();

    // Update state (GitHub logic)
    freeLocker.isFree = false;
    freeLocker.isOpen = true; 
    await freeLocker.save();

    // Unity Simulation (Your Logic)
    const io = req.app.get("io");
    if (io) {
      io.emit("openLocker", { lockerId: freeLocker.lockerId });
      setTimeout(() => {
        io.emit("closeLocker", { lockerId: freeLocker.lockerId });
      }, 5000);
    }

    // Email logic
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: apartment.gmail,
        subject: "Package Delivery Notification",
        text: `Hello ${apartment.nameOfOwner}, a delivery has been placed in locker ${freeLocker.lockerId}. Your OTP is: ${generatedOtp}`,
      });
    } catch (e) { console.error("Email failed:", e.message); }

    // Log Event (GitHub logic)
    await new Event({
      type: 'DELIVERY',
      description: `New package for ${apartment.nameOfOwner} in Locker ${freeLocker.lockerId}`,
      lockerId: freeLocker.lockerId,
      apartmentId: apartment.apartmentId
    }).save();

    return res.status(200).json({
      success: true,
      nameOfOwner: apartment.nameOfOwner,
      lockerId: freeLocker.lockerId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- PICKUP ROUTE (MERGED) ---
router.post("/pickup", async (req, res) => {
  try {
    const { apartmentId, passcode } = req.body;
    const activeDelivery = await DeliveryLog.findOne({
      apartmentId,
      otp: passcode,
      isPickedUp: false
    });

    if (!activeDelivery) return res.status(401).json({ success: false, message: "Invalid Passcode" });

    activeDelivery.isPickedUp = true;
    await activeDelivery.save();

    await Locker.findOneAndUpdate(
      { lockerId: activeDelivery.lockerId },
      { isFree: true, isOpen: true }
    );

    // Unity Simulation (Your Logic)
    const io = req.app.get("io");
    if (io) {
      io.emit("openLocker", { lockerId: activeDelivery.lockerId });
      setTimeout(() => {
        io.emit("closeLocker", { lockerId: activeDelivery.lockerId });
      }, 5000);
    }

    const history = new PickupLog({
      apartmentId: activeDelivery.apartmentId,
      lockerId: activeDelivery.lockerId,
    });
    await history.save();

    // Log Event (GitHub logic)
    await new Event({
      type: 'PICKUP',
      description: `Package collected by resident of Apt ${apartmentId}`,
      lockerId: activeDelivery.lockerId,
      apartmentId: apartmentId
    }).save();

    res.status(200).json({ success: true, message: "Locker Unlocked!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- NEW GITHUB FEATURES (SIMULATION & EVENTS) ---
router.post("/locker/open", async (req, res) => {
  try {
    const { lockerId } = req.body;
    const locker = await Locker.findOne({ lockerId });
    if (!locker) return res.status(404).json({ success: false });
    locker.isOpen = true;
    await locker.save();
    res.status(200).json({ success: true, message: "Locker opened" });
  } catch (error) { res.status(500).json({ success: false }); }
});

router.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ timestamp: -1 }).limit(100);
    res.status(200).json(events);
  } catch (error) { res.status(500).json({ success: false }); }
});

module.exports = router;