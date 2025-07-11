const crypto = require("crypto");

function generateRandomUint256() {
  // Generate 32 random bytes (256-bit number)
  const randomBytes = crypto.randomBytes(32);
  
  // Convert to hex and take the first 64 hex characters (full 256-bit)
  const hexString = randomBytes.toString("hex");

  // Convert hex string to a BigInt 
  return BigInt("0x" + hexString)
}

module.exports = { generateRandomUint256 };
