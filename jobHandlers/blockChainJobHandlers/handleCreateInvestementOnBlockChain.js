const Investment = require("../../models/Investment");
const Property = require("../../models/Property");
const { contract } = require("../../blockchain/blockchainService");
const { redlock } = require("../../config/redisClient");
const {
  failedInvestmentQueue,
  investmentDLQ,
} = require("../../config/jobQueue");
const { publish } = require("../../config/publish");

async function handleCreateInvestmentOnBlockChain(data) {
  const {
    investmentId,
    wallet,
    propertyId,
    propertyBlockChainId,
    amountInvested,
    ownershipPercentage,
  } = data;

  const lockResource = `locks:property:${propertyId}`;
  const lockTTL = 15000;
  let lock;

  // Try acquiring lock with retries
  for (let i = 0; i < 3; i++) {
    try {
      lock = await redlock.acquire([lockResource], lockTTL);
      console.log("🔒 Lock acquired on property:", propertyId);
      break;
    } catch (err) {
      console.warn(`🔁 Lock attempt ${i + 1} failed. Retrying...`);
      await new Promise((res) => setTimeout(res, 1000));
    }
  }

  // Push to fallback if lock fails
  if (!lock) {
    console.error("🚫 Could not acquire lock. Pushing to fallback queue.");
    await failedInvestmentQueue.add("failedLockJob", job.data);
    return;
  }

  try {
    console.log("🔧 Processing blockchain investment...");
    console.log("📤 Sending transaction to contract...");

    const property = await Property.findById(propertyId);

    const ownershipPercentage = (amountInvested / property.price) * 100;

    const tx = await contract.recordInvestment(
      BigInt(investmentId),
      BigInt(propertyBlockChainId),
      wallet,
      amountInvested,
      ownershipPercentage
    );

    console.log("⏳ Waiting for 1 confirmation...");
    const receipt = await tx.wait(1);

    if (receipt.status !== 1) throw new Error("Transaction failed");

    console.log("✅ On-chain success. Updating investment to 'active'...");

    publish(tx);

    await Investment.findOneAndUpdate(
      { blockchainId: investmentId },
      {
        transactionHash: tx.hash,
        ownershipPercentage,
        status: "active",
      }
    );

    property.ownershipLeft -= amountInvested;
    await property.save();

    console.log("🎉 Blockchain job complete!");
  } catch (err) {
    console.error("❌ Blockchain processing failed:", err.message);
    throw err;
  } finally {
    try {
      await lock.release();
      console.log("🔓 Lock released for property:", propertyId);
    } catch (releaseErr) {
      console.error("⚠️ Failed to release lock:", releaseErr.message);
    }
  }
}
module.exports = { handleCreateInvestmentOnBlockChain };
