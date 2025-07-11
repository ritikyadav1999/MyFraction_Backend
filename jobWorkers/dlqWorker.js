const { Worker } = require("bullmq");
const { blockchainQueue } = require("../config/jobQueue");
const { redisClient } = require("../config/redisClient");

const dlqWorker = new Worker(
  "investmentDLQ",
  async (job) => {
    if (job.failedReason.includes("nonce")) {
      await blockchainQueue.add(job.name, job.data);
      await job.remove();
      console.log(`🔁 Auto-retried job ${job.id}`);
    }
  },
  { connection: redisClient }
);

dlqWorker.on("completed", (job) => {
  console.log(`✅ Blockchain job ${job.id} has been added.`);
});

module.exports = { dlqWorker };