const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  guestName: String,
  guestEmail: String,
  date: String,
  time: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);