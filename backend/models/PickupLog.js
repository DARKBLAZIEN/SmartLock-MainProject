const mongoose = require("mongoose");

const pickupLogSchema = new mongoose.Schema({
  apartmentId: { type: String, required: true },
  lockerId: { type: String, required: true },
  pickupTime: { type: Date, default: Date.now }
},{ collection: 'pickup_logs' });

module.exports = mongoose.model("PickupLog", pickupLogSchema);