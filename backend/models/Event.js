const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['DELIVERY', 'PICKUP', 'OPEN', 'CLOSE', 'RESET', 'SYSTEM_ALERT', 'ADMIN_OVERRIDE']
  },
  description: { type: String, required: true },
  lockerId: { type: String },
  apartmentId: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { collection: 'events' });

module.exports = mongoose.model("Event", eventSchema);
