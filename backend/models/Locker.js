const mongoose = require("mongoose");

const lockerSchema = new mongoose.Schema({
  lockerId: { type: String, required: true, unique: true },
  isFree: { type: Boolean, default: true },
  isOpen: { type: Boolean, default: false }
},{ collection: 'lockers' });

module.exports = mongoose.model("Locker", lockerSchema);