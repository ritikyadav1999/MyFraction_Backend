const Investment = require("../../models/Investment");
const { blockchainQueue } = require("../../config/jobQueue");


async function handleListInvestment({ investmentId, askingPrice , wallet}) {
  let result = {
    success: false,
    message: "",
  };

  try {
    // Find the investment in the database
    const investment = await Investment.findById(investmentId);
    if (!investment) {
      result.message = `❌ Investment with ID ${investmentId} not found.`;
      throw new Error(result.message);
    }

    if (!investment.blockchainId) {
      result.message = `❌ Blockchain ID missing for investment ${investmentId}.`;
      throw new Error(result.message);
    }

    if (
      investment.status === "listed" ||
      investment.status === "list_pending"
    ) {
      result.message = `❌ Investment ${investmentId} is already listed or listing is in progress.`;
      throw new Error(result.message);
    }

    // Update the investment status and asking price
    investment.status = "list_pending";
    investment.askingPrice = askingPrice;

    // Save the updated investment
    await investment.save();

    result.success = true;
    result.message = `✅ Investment ${investmentId} marked as 'list_pending' and asking price set.`;

    // forward the job to the blockchain queue
    await blockchainQueue.add("listInvestmentForSaleOnBlockChain", {
      investmentId,
      investmentBlockChainId:investment.blockchainId,
      askingPrice,
      wallet
    });

    console.log(result.message);
  } catch (error) {
    console.error(`❌ Error processing investment ${investmentId}:`, error);
    result.success = false;
    result.message =
      error.message || "An error occurred while processing the investment.";

    console.log(result);
    
  }
}

module.exports = { handleListInvestment };
