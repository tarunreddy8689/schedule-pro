const Availability = require("../models/Availability");
const User = require("../models/User");

exports.setAvailability = async (req, res) => {
  try {
    const { userId, days, startTime, endTime } = req.body;

    const availability = await Availability.findOneAndUpdate(
      { userId },
      { days, startTime, endTime },
      { upsert: true, new: true }
    );

    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    const availability = await Availability.findOne({ userId: user._id });

    res.json({ user, availability });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};