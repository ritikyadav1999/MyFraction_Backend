const { Wallet }  =  require("ethers");
const { randomBytes } =  require("crypto");

const generateFakeAddress = () => {
  // Generate a random 32-byte private key
  const privateKey = "0x" + randomBytes(32).toString("hex");

  // Derive the Ethereum address
  const wallet = new Wallet(privateKey);
  return wallet.address;
};

module.exports = {generateFakeAddress};
