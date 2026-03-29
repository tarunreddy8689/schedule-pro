const express = require("express");
const router = express.Router();
const {
  setAvailability,
  getAvailability
} = require("../controllers/availabilityController");

router.post("/", setAvailability);
router.get("/:username", getAvailability);

module.exports = router;