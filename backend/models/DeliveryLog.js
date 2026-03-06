const mongoose = require("mongoose");

const deliveryLogSchema = new mongoose.Schema({
  apartmentId: { type: String, required: true },
  lockerId: { type: String, required: true },
  otp: { type: String, required: true },
  deliveryTime: { type: Date, default: Date.now },
  isPickedUp: { type: Boolean, default: false } // Helps track if this log is still "active"
},{ collection: 'delivery_logs' });

module.exports = mongoose.model("DeliveryLog", deliveryLogSchema);