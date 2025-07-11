const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const Property = require("../models/Property");
const Investment = require("../models/Investment");
const User = require("../models/User");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await User.findById(userId).select("name email wallet");
    const investments = await Investment.find({ user: userId }).populate(
      "property",
      "title location price blockchainId isFullyFunded"
    );

    res.status(200).json({
      success: true,
      profile,
      investments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Dashboard loading failed.",
    });
  }
});

module.exports = router;
