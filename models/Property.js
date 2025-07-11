const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // Total price of the property
  location: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalInvested: { type: Number, default: 0 }, // Total amount invested so far
  ownershipLeft: { type: Number, default: function () { return this.price; } }, // Remaining value left
  totalInvestors: { type: Number, default: 0 }, // Number of investors
  isFullyFunded: { type: Boolean, default: false }, // Mark when fully funded
  blockchainId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Automatically update ownershipLeft & totalInvestors
PropertySchema.pre("save", function (next) {
  this.ownershipLeft = this.price - this.totalInvested;
  this.isFullyFunded = this.ownershipLeft <= 0;
  next();
});

module.exports = mongoose.model("Property", PropertySchema);
