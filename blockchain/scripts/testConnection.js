require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const contractPath = path.join(__dirname, "../artifacts/contracts/FractionalOwnership.sol/FractionalOwnership.json");
const contractABI = JSON.parse(fs.readFileSync(contractPath, "utf8")).abi;

// Ensure correct contract address is loaded
console.log("Contract Address:", process.env.CONTRACT_ADDRESS);

// Connect to Hardhat local network
const provider = new ethers.JsonRpcProvider(process.env.LOCAL_RPC_URL);

// Use Hardhat account for transactions
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Check if contract address is valid
if (!process.env.CONTRACT_ADDRESS) {
  console.error("Contract address is missing in the .env file.");
  process.exit(1);
}

// Connect to the smart contract
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

console.log("Contract connected successfully!");
