const { blockchainQueue } = require("../../config/jobQueue");
const { generateRandomUint256 } = require("../../utils/generateUint256");
const Investment = require("../../models/Investment");

async function handleCreateInvestment({
  userId,
  propertyId,
  propertyBlockChainId,
  wallet,
  amountInvested,
}) {
  const investmentBlockchainId = generateRandomUint256();

  const investment = new Investment({
    user: userId,
    property: propertyId,
    amountInvested,
    ownershipPercentage: 0,
    transactionHash: null,
    status: "pending",
    blockchainId: investmentBlockchainId,
  });

  console.log(wallet);

  const savedInvestment = await investment.save();

  console.log("✅ Investment marked as pending in DB");

  await blockchainQueue.add("createInvestmentOnBlockChain", {
    investmentId: investmentBlockchainId.toString(),
    wallet,
    propertyId,
    propertyBlockChainId,
    amountInvested,
  });

  console.log("📤 Job forwarded to blockchainQueue.");
}

module.exports = { handleCreateInvestment };
