const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const Investment = require("../models/Investment");
const User = require("../models/User");
const { generateHash } = require("../utils/generateHash");
const { contract } = require("../blockchain/blockchainService");
const router = express.Router();

// 🟢 Protected Route (Only Accessible with JWT)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await User.findById(userId);
    res.status(200).json({
      success: true,
      name:profile.name,
      email:profile.email,
      wallet:profile.wallet
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success:false,
      message:err.message
    })
  }
});

// ✅ Get all investments of a user
router.get("/investments", authenticateToken, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id }).populate(
      "property"
    );
    res.status(200).json(investments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/set-secret-key", authenticateToken, async (req, res) => {
  const { secretKey } = req.body;

  if (!secretKey) {
    return res.status(400).json({ error: "Secret key is required" });
  }

  try {
    // Hash the secret key
    const secretKeyHash = generateHash(secretKey);

    // Call smart contract to store the hashed secret key
    const wallet = req.user.wallet;
    console.log("i am here");

    const tx = await contract.setSecretKey(wallet, secretKeyHash);
    await tx.wait();

    res.json({
      message: "✅ Secret key set successfully!",
      txHash: tx.hash,
    });
  } catch (error) {
    console.error("Error setting secret key:", error);
    res.status(500).json({ error: "Failed to set secret key" });
  }
});

module.exports = router;
