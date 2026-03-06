const mongoose = require("mongoose");

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
    },
    nameOfOwner: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Apartment", apartmentSchema);
