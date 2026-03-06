const mongoose = require("mongoose");

const lockerSchema = new mongoose.Schema({
  lockerId: { type: String, required: true, unique: true },
  isFree: { type: Boolean, default: true }
},{ collection: 'lockers' });

module.exports = mongoose.model("Locker", lockerSchema);