const Investment = require("../../models/Investment");
const { contract } = require("../../blockchain/blockchainService");
const { redlock } = require("../../config/redisClient");
const {
  failedInvestmentQueue,
  investmentDLQ,
} = require("../../config/jobQueue");
const { publish } = require("../../config/publish");

async function handleListInvestmentOnSaleOnBlockChain(data) {
  const { investmentId, investmentBlockChainId, askingPrice ,wallet} = data;

  console.log(data);

  const lockResource = `locks:property:${investmentId}`;
  const lockTTL = 15000;
  let lock;

  // Try acquiring lock with retries
  for (let i = 0; i < 3; i++) {
    try {
      lock = await redlock.acquire([lockResource], lockTTL);
      console.log("🔒 Lock acquired on investment:", investmentId);
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
    console.log("🔧 Processing Listing on blockchain...");
    console.log("📤 Sending transaction to contract...");

    const tx = await contract.listInvestmentForSale(
      BigInt(investmentBlockChainId),
      wallet,
      askingPrice
    );

    console.log("⏳ Waiting for 1 confirmation...");
    const receipt = await tx.wait(1);

    if (receipt.status !== 1) throw new Error("Transaction failed");

    console.log("✅ On-chain success. Updating investment to 'active'...");

    publish(tx);

    const investment = await Investment.findById(investmentId);
    investment.transactionHash = tx.hash,
    investment.status = "listed"

    await investment.save();

    console.log("🎉 Blockchain job complete!");
  } catch (err) {
    console.error("❌ Blockchain processing failed:", err.message);
    throw err;
  } finally {
    try {
      await lock.release();
      console.log("🔓 Lock released for Investment:", investmentId);
    } catch (releaseErr) {
      console.error("⚠️ Failed to release lock:", releaseErr.message);
    }
  }
}

module.exports = { handleListInvestmentOnSaleOnBlockChain };
