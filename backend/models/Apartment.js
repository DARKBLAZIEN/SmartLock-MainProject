const mongoose = require("mongoose");
const { encryptDeterministic, decryptDeterministic } = require("../utils/encryption");

const apartmentSchema = new mongoose.Schema(
  {
    apartmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    gmail: {
      type: String,
      required: true,
      trim: true,
      // Encrypt before saving to DB, decrypt when reading
      set: (value) => value ? encryptDeterministic(value.toLowerCase().trim()) : value,
      get: (value) => value ? decryptDeterministic(value) : value,
    },
    nameOfOwner: {
      type: String,
      required: true,
      trim: true,
      set: (value) => value ? encryptDeterministic(value.trim()) : value,
      get: (value) => value ? decryptDeterministic(value) : value,
    },
  },
  {
    timestamps: true,
    // CRITICAL: enable getters so set/get hooks apply when reading documents
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

module.exports = mongoose.model("Apartment", apartmentSchema);
