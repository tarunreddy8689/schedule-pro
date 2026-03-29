const Appointment = require("../models/Appointment");

exports.bookSlot = async (req, res) => {
  try {
    const { hostId, guestName, guestEmail, date, time } = req.body;

    console.log("Booking request:", { hostId, guestName, guestEmail, date, time });

    // ❗ Prevent double booking
    const existing = await Appointment.findOne({ hostId, date, time });

    if (existing) {
      return res.status(400).json({ msg: "Slot already booked" });
    }

    const appointment = await Appointment.create({
      hostId,
      guestName,
      guestEmail,
      date,
      time,
      status: "confirmed" // Set status to confirmed when booked
    });

    console.log("Appointment created:", appointment);
    res.json(appointment);
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Fetching bookings for user:", userId);
    console.log("Request URL:", req.originalUrl);
    
    // Validate userId
    if (!userId) {
      console.log("No userId provided");
      return res.status(400).json({ error: "User ID is required" });
    }
    
    const bookings = await Appointment.find({
      hostId: userId
    }).sort({ createdAt: -1 }); // Sort by newest first

    console.log("Found bookings:", bookings.length);
    console.log("Bookings data:", bookings);
    
    res.json(bookings);
  } catch (err) {
    console.error("Get bookings error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: err.message });
  }
};