const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  wallet: { type: String, required: true, unique: true },  // For the smart contract
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false }, // Optional
  password: { type: String, required: function () { return !this.googleId; } },
  googleId: { type: String, unique: true, sparse: true }, // ✅ No duplicate Google IDs
  hasPassword: { type: Boolean, default: false }, // ✅ Tracks if password is set later
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
