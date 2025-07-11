// routes/investment.js
const express = require("express");
const { dbWriteQueue } = require("../config/jobQueue");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const Property = require("../models/Property");
const Investment = require("../models/Investment");
const User = require("../models/User");

// Create a queue instance
router.post("/invest", authenticateToken, async (req, res) => {
  try {
    const { propertyId, amountInvested } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if the investment amount is valid
    if (amountInvested > property.ownershipLeft) {
      return res
        .status(400)
        .json({ message: "Investment exceeds available ownership" });
    }

    const user = await User.findOne({ wallet: req.user.wallet });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user.id;

    // Add job to the queue
    await dbWriteQueue.add("createInvestment", {
      userId,
      propertyId,
      propertyBlockChainId: property.blockchainId,
      wallet: req.user.wallet,
      amountInvested,
    });

    return res
      .status(202)
      .json({ message: "Investment request received and queued" });
  } catch (error) {
    console.error("Error queuing investment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post(
  "/listInvestmentForSale/:investmentId",
  authenticateToken,
  async (req, res) => {
    try {
      const { investmentId } = req.params;
      const { askingPrice } = req.body;

      const wallet = req.user.wallet;

      // Add job to the queue
      await dbWriteQueue.add("listInvestmentForSale", {
        investmentId,
        askingPrice,
        wallet,
      });

      return res.status(202).json({
        success: true,
        message: "Investment listing is pending and queued for processing",
      });
    } catch (err) {
      console.error("❌ Error while listing investment for sale:", err.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error while listing investment",
      });
    }
  }
);

module.exports = router;
