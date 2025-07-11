const mongoose = require("mongoose");
const Property = require("./Property");

const InvestmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  amountInvested: { type: Number, required: true },
  ownershipPercentage: { type: Number, required: true },
  transactionHash: { type: String, default: null }, // Blockchain transaction hash
  status: {
    type: String,
    enum: ["active", "listed", "sold","pending","list_pending","cancel_pending"],
  }, // Tracks ownership state
  askingPrice: { type: Number, default: null }, // Price set by user when listing for sale
  createdAt: { type: Date, default: Date.now },
  blockchainId: { type: String, required: true } 
});

// ✅ Update Property Model after investment
InvestmentSchema.post("save", async function () {
  const property = await mongoose.model("Property").findById(this.property);
  if (property) {
    property.totalInvested += this.amountInvested;
    property.totalInvestors += 1;
    await property.save();
  }
});

module.exports = mongoose.model("Investment", InvestmentSchema);
