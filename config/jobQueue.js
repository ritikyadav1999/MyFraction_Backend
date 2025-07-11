const { Queue } = require("bullmq");
const { redisClient } = require("./redisClient");


// DB Write Queue for managing investments related to database operations
const dbWriteQueue = new Queue("dbWriteQueue", {
  connection: redisClient,
});

// Blockchain Queue for handling smart contract transactions
const blockchainQueue = new Queue("blockchainQueue", {
  connection: redisClient,
});


// Fallback queue in case of lock failures
const failedInvestmentQueue = new Queue("failedInvestmentQueue", {
  connection: redisClient,
});

const investmentDLQ = new Queue("investmentDLQ", {
  connection: redisClient, // Pass the Redis client here
});

module.exports = {
  dbWriteQueue,
  blockchainQueue,
  failedInvestmentQueue,
  investmentDLQ
};
