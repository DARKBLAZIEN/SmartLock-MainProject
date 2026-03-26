const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Apartment = require("../models/Apartment");
const Locker = require("../models/Locker");
const DeliveryLog = require("../models/DeliveryLog");
const RegistrationOTP = require("../models/RegistrationOTP");
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

// --- HARDWARE AGENT BRIDGE ---
const triggerHardwareUnlock = async (lockerId) => {
  // Only trigger physical hardware for L01 or L1
  if (lockerId !== "L01" && lockerId !== "L1") {
    console.log(`[Hardware] Skipping physical trigger for ${lockerId} (Virtual only).`);
    return false;
  }

  const hardwareUrl = process.env.HARDWARE_AGENT_URL || "http://10.99.28.186:5001/api/hardware/unlock";
  try {
    console.log(`[Hardware] Triggering physical lock for unit ${lockerId}...`);
    // Non-blocking fire-and-forget call to the Raspberry Pi
    fetch(hardwareUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lockerId })
    }).catch(err => console.error(`[Hardware Connection Failed] at ${hardwareUrl}:`, err.message));
    return true;
  } catch (err) {
    console.error(`[Hardware Helper Error]:`, err.message);
    return false;
  }
};

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
// Register a new Apartment (Resident) - Admin only, no OTP required
router.post("/register", async (req, res) => {
  try {
    console.log("Register Request Body:", req.body);
    const { apartmentId, nameOfOwner, gmail } = req.body;

    // Check if Apartment ID already exists
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
    const apartment = await Apartment.findOne({ apartmentId });
    if (!apartment) return res.status(404).json({ success: false, message: "Apartment not found" });

    const freeLocker = await Locker.findOne({ isFree: true });
    if (!freeLocker) {
      console.log("[Delivery] No free lockers found");
      return res.status(400).json({ success: false, message: "No lockers available" });
    }
    console.log(`[Delivery] Found free locker: ${freeLocker.lockerId}`);

    // 3. Generate cryptographically secure 6-digit OTP
    const generatedOtp = crypto.randomInt(100000, 1000000).toString();
    console.log("********************************");
    console.log("GENERATED OTP FOR PICKUP:", generatedOtp);
    console.log("********************************");

    // Database logic
    await new DeliveryLog({
      apartmentId: apartment.apartmentId,
      lockerId: freeLocker.lockerId,
      otp: generatedOtp,
    }).save();

    freeLocker.isFree = false;
    freeLocker.isOpen = true;
    await freeLocker.save();

    const io = req.app.get("io");
    io.emit("openLocker", { lockerId: freeLocker.lockerId });

    // Physical hardware trigger
    triggerHardwareUnlock(freeLocker.lockerId);

    try {
      const mailOptions = {
        from: `"SmartLock System" <${process.env.EMAIL_USER}>`,
        to: apartment.gmail,
        subject: `📦 Package Arrived - Locker ${freeLocker.lockerId}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: auto; padding: 0; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background-color: #4f46e5; padding: 25px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 22px;">SmartLock Notification</h2>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff; text-align: center;">
              <p style="font-size: 16px; color: #475569;">Hello <strong>${apartment.nameOfOwner}</strong>,</p>
              <p style="font-size: 15px; color: #64748b;">Your package is ready for pickup in <strong>Unit ${freeLocker.lockerId}</strong>.</p>
              
              <div style="margin: 30px 0; padding: 20px; background-color: #f1f5f9; border-radius: 12px;">
                <p style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 15px;">Your One-Time Passcode</p>
                
                <div style="
                  display: inline-block;
                  background-color: #1e293b; 
                  color: #38bdf8; 
                  font-family: 'Courier New', monospace; 
                  font-size: 36px; 
                  font-weight: bold; 
                  padding: 15px 25px; 
                  border-radius: 8px; 
                  letter-spacing: 6px; 
                  border: 2px solid #38bdf8;
                  -webkit-user-select: all; 
                  user-select: all;
                  cursor: pointer;
                ">
                  ${generatedOtp}
                </div>
                
                <p style="font-size: 12px; color: #64748b; margin-top: 15px;">
                  Tap or click the code once to select it.
                </p>
              </div>
              
              <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
                Enter this code at the terminal to unlock your compartment.
              </p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              <p>SmartLock CUSAT Project - Automated Security Notification</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (err) { console.error(err); }

    return res.status(200).json({ success: true, lockerId: freeLocker.lockerId });
  } catch (error) {
    res.status(500).json({ success: false });
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
      { isFree: true, isOpen: true } // Simulating physical unlock
    );

    const io = req.app.get("io");
    io.emit("openLocker", {
      lockerId: activeDelivery.lockerId
    });

    // Physical hardware trigger
    triggerHardwareUnlock(activeDelivery.lockerId);

    const history = new PickupLog({
      apartmentId: activeDelivery.apartmentId,
      lockerId: activeDelivery.lockerId,
    });

    await history.save();

    // 5. Send Pickup Confirmation Email (non-blocking — email failure must not affect pickup success)
    try {
      const apartment = await Apartment.findOne({ apartmentId });
      if (apartment) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: apartment.gmail,
          subject: "Package Collected",
          text: `Hello ${apartment.nameOfOwner}, your package in locker ${activeDelivery.lockerId} has been successfully collected.`
        });
      }
    } catch (emailError) {
      console.error("Pickup confirmation email failed (non-fatal):", emailError.message);
    }
    const apartment = await Apartment.findOne({ apartmentId });

    // --- ENHANCED PICKUP CONFIRMATION EMAIL ---
    try {
      await transporter.sendMail({
        from: `"SmartLock System" <${process.env.EMAIL_USER}>`,
        to: apartment.gmail,
        subject: `✅ Package Collected - Unit ${activeDelivery.lockerId}`,
        text: `Hello ${apartment.nameOfOwner}, your package in locker ${activeDelivery.lockerId} has been successfully collected.`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: auto; padding: 0; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #10b981; padding: 25px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">Pickup Confirmed</h2>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff;">
              <p style="font-size: 16px; color: #475569; margin-top: 0;">Hello <strong>${apartment.nameOfOwner}</strong>,</p>
              <p style="font-size: 15px; color: #64748b; line-height: 1.6;">This is a confirmation that your package has been successfully retrieved from the SmartLock system.</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                  <span style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Locker Source :   </span>
                  <span style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Unit ${activeDelivery.lockerId}</span>
                </div>
                
                <div style="border-top: 1px solid #e2e8f0; padding-top: 15px;">
                  <span style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 10px;">Registered Apartment</span>
                  
                  <div style="display: table; width: 100%; border-collapse: separate;">
                    <div style="display: table-cell; background-color: #f1f5f9; color: #475569; font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; padding: 10px 15px; border-radius: 8px 0 0 8px; vertical-align: middle; border: 1px solid #e2e8f0;">
                      ${apartmentId}
                    </div>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center; padding: 10px; border-radius: 8px; background-color: #ecfdf5; border: 1px solid #d1fae5;">
                <p style="font-size: 13px; color: #065f46; margin: 0;">Locker <strong>${activeDelivery.lockerId}</strong> is now vacant and ready for new deliveries.</p>
              </div>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">SmartLock CUSAT Project Team</p>
              <p style="margin: 5px 0 0;">Thank you for using our automated services.</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error("Pickup Email failed:", emailError.message);
    }

    // 6. Log Event
    await new Event({
      type: 'PICKUP',
      description: `Package collected by resident of Apt ${apartmentId}`,
      lockerId: activeDelivery.lockerId,
      apartmentId: apartmentId
    }).save();

    return res.status(200).json({
      success: true,
      message: "Locker Unlocked! Please collect your package.",
      lockerId: activeDelivery.lockerId
    });

  } catch (error) {
    console.error("Pickup error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update Resident - Admin only, no OTP required
router.put("/:id", async (req, res) => {
  try {
    const { nameOfOwner, gmail, apartmentId } = req.body;
    const existingResident = await Apartment.findById(req.params.id);

    if (!existingResident) {
      return res.status(404).json({ success: false, message: "Resident not found" });
    }

    // Update the resident
    existingResident.nameOfOwner = nameOfOwner || existingResident.nameOfOwner;
    existingResident.gmail = gmail ? gmail.toLowerCase() : existingResident.gmail;
    existingResident.apartmentId = apartmentId || existingResident.apartmentId;

    await existingResident.save();

    res.json({ success: true, resident: existingResident });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- LOCKER SIMULATION ---

// Simulate opening the locker (physical action)
router.post("/locker/open", async (req, res) => {
  try {
    const { lockerId } = req.body;
    const locker = await Locker.findOne({ lockerId });
    if (!locker) return res.status(404).json({ success: false, message: "Locker not found" });

    locker.isOpen = true;
    await locker.save();

    const io = req.app.get("io");
    io.emit("openLocker", { lockerId });

    // Physical hardware trigger
    triggerHardwareUnlock(lockerId);

    await new Event({
      type: 'ADMIN_OVERRIDE',
      description: `Locker door opened by administrator override`,
      lockerId: lockerId
    }).save();

    console.log(`[Locker Simulation] Locker ${lockerId} OPENED.`);
    res.status(200).json({ success: true, message: "Locker opened" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Simulate closing the locker (physical action)
// Locate this existing route and update it to this:
router.post("/locker/close", async (req, res) => {
  try {
    const { lockerId } = req.body;
    const locker = await Locker.findOne({ lockerId });
    if (!locker) return res.status(404).json({ success: false, message: "Locker not found" });

    locker.isOpen = false;
    await locker.save();

    // This is the CRITICAL line that tells Unity to close the door
    const io = req.app.get("io");
    io.emit("closeLocker", { lockerId });

    await new Event({
      type: 'CLOSE',
      description: `Locker door closed and secured via User Interface`,
      lockerId: lockerId
    }).save();

    console.log(`[Locker Control] Locker ${lockerId} CLOSED and LOCKED.`);
    res.status(200).json({ success: true, message: "Locker closed and locked" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all events
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ timestamp: -1 }).limit(100);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete Resident
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Apartment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Resident not found" });
    res.json({ success: true, message: "Resident deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Test Alert Simulation
router.post("/test/alert", async (req, res) => {
  try {
    const { lockerId, message } = req.body;
    await new Event({
      type: 'SYSTEM_ALERT',
      description: message || `System Alert: Irregular activity detected on unit ${lockerId}`,
      lockerId: lockerId
    }).save();
    res.json({ success: true, message: "Alert logged" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;