// dbWorker.js
const { Worker } = require("bullmq");
const connectDB = require("../config/db");
const { redisClient } = require("../config/redisClient");
const {
  handleCreateInvestment,
} = require("../jobHandlers/dbJobHandlers/handleCreateInvestment");
const {
  handleListInvestment,
} = require("../jobHandlers/dbJobHandlers/handleListInvestment");

connectDB();

const dbWorker = new Worker(
  "dbWriteQueue",
  async (job) => {
    const jobType = job.name;
    const data = job.data;

    switch (jobType) {
      case "createInvestment":
        await handleCreateInvestment(data);
        break;

      case "listInvestmentForSale":
        await handleListInvestment(data);
        break;

      default:
        console.warn(`⚠️ Unknown job type: ${jobType}`);
    }
  },
  {
    connection: redisClient,
    concurrency: 5,
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
    timeout: 30000,
  }
);

dbWorker.on("completed", (job) => {
  console.log(`✅ DB Write Job ${job.id} completed.`);
});

dbWorker.on("failed", (job, err) => {
  console.error(`❌ DB Write Job ${job.id} failed:`, err);
});

module.exports = { dbWorker };
