const express = require("express");
const nodemailer = require("nodemailer");
const Apartment = require("../models/Apartment");
const Locker = require("../models/Locker");
const DeliveryLog = require("../models/DeliveryLog");

const router = express.Router();

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS, // Your Gmail App Password
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

// Register a new Apartment (Resident)
router.post("/register", async (req, res) => {
  try {
    console.log("Register Request Body:", req.body);
    const { apartmentId, nameOfOwner, gmail } = req.body;

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

    // 1. Check if Apartment exists
    const apartment = await Apartment.findOne({ apartmentId });
    if (!apartment) {
      console.log(`[Delivery] Apartment ${apartmentId} not found`);
      return res.status(404).json({ success: false, message: "Apartment not found" });
    }

    // 2. Find an available locker
    const allLockers = await Locker.find();
    console.log(`[Delivery] Total Lockers in DB: ${allLockers.length}`);

    const freeLocker = await Locker.findOne({ isFree: true });
    if (!freeLocker) {
      console.log("[Delivery] No free lockers found");
      return res.status(400).json({ success: false, message: "No lockers available" });
    }
    console.log(`[Delivery] Found free locker: ${freeLocker.lockerId}`);

    // 3. Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("********************************");
    console.log("GENERATED OTP FOR PICKUP:", generatedOtp);
    console.log("********************************");

    // 4. Save the Delivery Log
    const newLog = new DeliveryLog({
      apartmentId: apartment.apartmentId,
      lockerId: freeLocker.lockerId,
      otp: generatedOtp,
    });
    await newLog.save();

    // 5. Update Locker Status to Occupied
    freeLocker.isFree = false;
    await freeLocker.save();

    // 6. Send Email
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: apartment.gmail,
        subject: "Package Delivery Notification",
        text: `Hello ${apartment.nameOfOwner}, a delivery has been placed in locker ${freeLocker.lockerId}. Your OTP is: ${generatedOtp}`,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email failed to send (CHECK .ENV CREDENTIALS):", emailError.message);
      // Continue execution - do not fail the request just because email failed
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
    const { apartmentId, passcode } = req.body; // passcode is the OTP from the email

    // 1. Find the active delivery log matching ID and OTP
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

    // 2. Mark delivery as completed
    activeDelivery.isPickedUp = true;
    await activeDelivery.save();

    // 3. Update the locker to be FREE again
    await Locker.findOneAndUpdate(
      { lockerId: activeDelivery.lockerId },
      { isFree: true }
    );

    // 4. Create a permanent Pickup Log for history
    const history = new PickupLog({
      apartmentId: activeDelivery.apartmentId,
      lockerId: activeDelivery.lockerId,
    });
    await history.save();

    // 5. Send Pickup Confirmation Email (Optional but recommended)
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