const { contract, provider } = require('../blockchain/blockchainService'); // Import contract and provider

// Listen for 'InvestmentRecorded' event from smart contract
contract.on("InvestmentRecorded", (investmentId, propertyId, amountInvested, ownershipPercentage, event) => {
  console.log("New Investment Recorded:", {
    investmentId,
    propertyId,
    amountInvested,
    ownershipPercentage,
    event
  });

  // You can handle the event here, for example, updating your database or performing additional logic
});

// Listen to WebSocket events
provider.on("block", (blockNumber) => {
  console.log("New Block:", blockNumber);
});

provider.on("pending", (txHash) => {
  console.log("New Pending Transaction:", txHash);
});

provider.on("error", (error) => {
  console.error("Provider Error:", error);
});
