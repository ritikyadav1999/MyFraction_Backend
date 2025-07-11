// blockchainService.js
require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load contract ABI
const contractPath = path.join(
  __dirname,
  "./artifacts/contracts/FractionalOwnership.sol/FractionalOwnership.json"
);
const contractABI = JSON.parse(fs.readFileSync(contractPath, "utf8")).abi;

// Connect to Hardhat local network using JsonRpcProvider
const provider = new ethers.JsonRpcProvider(process.env.LOCAL_RPC_URL);  // Make sure this is correct
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Ensure contract address and ABI are correct
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,  // Ensure this is the correct contract address
  contractABI,
  wallet
);

module.exports = { contract, provider };
