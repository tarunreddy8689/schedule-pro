const express = require("express");
const router = express.Router();
const { bookSlot, getBookings } = require("../controllers/bookingController");

router.post("/", bookSlot);
router.get("/:userId", getBookings);

module.exports = router;