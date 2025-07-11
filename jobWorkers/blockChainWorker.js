const { Worker } = require("bullmq");
const connectDB = require("../config/db");
const {
  handleCreateInvestmentOnBlockChain,
} = require("../jobHandlers/blockChainJobHandlers/handleCreateInvestementOnBlockChain");
const {handleListInvestmentOnSaleOnBlockChain} = require("../jobHandlers/blockChainJobHandlers/handleListInvestmentOnSaleOnBlockChain")
const { failedInvestmentQueue, investmentDLQ } = require("../config/jobQueue");
const { redisClient } = require("../config/redisClient");
connectDB();

const blockchainWorker = new Worker(
  "blockchainQueue",
  async (job) => {
    const jobType = job.name;
    const data = job.data;
    switch (jobType) {
      case "createInvestmentOnBlockChain":
        await handleCreateInvestmentOnBlockChain(data);
        break;

      case "listInvestmentForSaleOnBlockChain":
        await handleListInvestmentOnSaleOnBlockChain(data);
        break;

      default:
        console.warn(`⚠️ Unknown job type: ${jobType}`);
    }
  },
  {
    connection: redisClient,
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    timeout: 60000,
  }
);

// Handle DLQ for repeated failures
blockchainWorker.on("failed", async (job, err) => {
  console.error(`❌ Blockchain job ${job.id} failed:`, err.message);
  if (job.attemptsMade >= job.opts.attempts) {
    console.log("🚨 Max retries hit. Pushing to DLQ.");
    await investmentDLQ.add(job.name, job.data, {
      jobId: `failedJob-${job.id}`, // Convert job.id to string
      removeOnComplete: true,
    });
  }
});

blockchainWorker.on("completed", (job) => {
  console.log(`✅ Blockchain job ${job.id} completed.`);
});

module.exports = { blockchainWorker };


