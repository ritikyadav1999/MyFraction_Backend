const express = require("express");
const Property = require("../models/Property");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
const {generateRandomUint256} = require("../utils/generateUint256")
const router = express.Router();

// ✅ Add Property (Without Image)
router.post("/add", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, price, location } = req.body;

    const property = new Property({
      title,
      description,
      price,
      location,
      createdBy: req.user.id,
      blockchainId: generateRandomUint256()
    });

    await property.save();
    res.status(201).json({ message: "Property added successfully", property });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Get All Properties
router.get("/all", async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Get Property by ID
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    res.status(200).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Delete Property (Admin Only)
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    await property.deleteOne();
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Update Property (Admin Only)
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { title, description, price, location } = req.body;
  
      const property = await Property.findById(req.params.id);
      if (!property) return res.status(404).json({ message: "Property not found" });
  
      // Update fields if provided
      if (title) property.title = title;
      if (description) property.description = description;
      if (price) property.price = price;
      if (location) property.location = location;
  
      await property.save();
      res.status(200).json({ message: "Property updated successfully", property });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

module.exports = router;
