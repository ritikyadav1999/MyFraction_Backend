require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 1337,  // Local Hardhat network
    },
    localhost: {
      url: "http://127.0.0.1:8545", // Localhost RPC URL
      // accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"], // Add a private key here (from MetaMask or Hardhat wallet)
    },
    ws: {
      url: "ws://127.0.0.1:8545",
    }
  },
};