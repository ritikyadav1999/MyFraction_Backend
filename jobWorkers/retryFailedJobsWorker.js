const { Worker } = require("bullmq");
const { redisClient } = require("../config/redisClient");
const { blockchainQueue, investmentDLQ } = require("../config/jobQueue");

const retryFailedJobsWorker = new Worker(
  "failedInvestmentQueue", // Listen to the fallback queue
  async (job) => {
    console.log(`🔁 Retrying failed lock job ${job.id}...`);

    // Add the job to the blockchainQueue for retry
    await blockchainQueue.add("retryInvestment", job.data, {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
    });

    console.log(`🚀 Job ${job.id} re-queued to blockchainQueue.`);
  },
  {
    connection: redisClient,
    attempts: 3,
    backoff: {
      type: "fixed",
      delay: 10000,
    },
    timeout: 30000,
  }
);

// If job fails even in the fallback processor, push to DLQ
retryFailedJobsWorker.on("failed", async (job, err) => {
  console.error(`❌ Retry job ${job.id} failed:`, err.message);
  if (job.attemptsMade >= job.opts.attempts) {
    console.log(`⚠️ Retry job ${job.id} pushed to DLQ.`);
    await investmentDLQ.add(job.name, job.data, {
      jobId: `failedJob-${job.id}`, 
      removeOnComplete: true,
    });
  }
});

retryFailedJobsWorker.on("completed", (job) => {
  console.log(`✅ Retry job ${job.id} completed.`);
});

module.exports = { retryFailedJobsWorker };
