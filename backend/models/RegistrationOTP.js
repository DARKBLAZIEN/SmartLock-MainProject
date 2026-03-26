const mongoose = require("mongoose");
const { encryptDeterministic, decryptDeterministic } = require("../utils/encryption");

const registrationOTPSchema = new mongoose.Schema({
    gmail: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        // Encrypt email for storage, decrypt on read, deterministic so it can be queried
        set: (value) => value ? encryptDeterministic(value.toLowerCase().trim()) : value,
        get: (value) => value ? decryptDeterministic(value) : value,
    },
    otp: {
        type: String,
        required: true,
        set: (value) => value ? encryptDeterministic(value) : value,
        get: (value) => value ? decryptDeterministic(value) : value,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Automatically delete after 10 minutes
    }
}, {
    toJSON: { getters: true },
    toObject: { getters: true },
});

module.exports = mongoose.model("RegistrationOTP", registrationOTPSchema);
