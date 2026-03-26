const mongoose = require("mongoose");
const { encryptDeterministic, decryptDeterministic } = require("../utils/encryption");

const deliveryLogSchema = new mongoose.Schema({
  apartmentId: { type: String, required: true },
  lockerId: { type: String, required: true },
  otp: {
    type: String,
    required: true,
    set: (value) => value ? encryptDeterministic(value) : value,
    get: (value) => value ? decryptDeterministic(value) : value,
  },
  deliveryTime: { type: Date, default: Date.now },
  isPickedUp: { type: Boolean, default: false } // Helps track if this log is still "active"
},{ 
  collection: 'delivery_logs',
  toJSON: { getters: true },
  toObject: { getters: true },
});

module.exports = mongoose.model("DeliveryLog", deliveryLogSchema);