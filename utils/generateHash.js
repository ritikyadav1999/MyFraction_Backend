const { ethers } = require("ethers");

function generateHash(secretKey) {
  const hash = ethers.keccak256(ethers.toUtf8Bytes(secretKey));
  return hash;
}

module.exports = { generateHash };
