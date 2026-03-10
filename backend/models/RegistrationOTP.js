const mongoose = require("mongoose");

const registrationOTPSchema = new mongoose.Schema({
    gmail: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Automatically delete after 10 minutes
    }
});

module.exports = mongoose.model("RegistrationOTP", registrationOTPSchema);
