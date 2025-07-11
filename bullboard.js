// bullBoard.js
const express = require("express");
const { ExpressAdapter } = require("@bull-board/express");
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");

// Import your queues
const {
  dbWriteQueue,
  blockchainQueue,
  failedInvestmentQueue,
  investmentDLQ,
} = require("./config/jobQueue"); // Adjust the path if different

const app = express();
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(dbWriteQueue),
    new BullMQAdapter(blockchainQueue),
    new BullMQAdapter(failedInvestmentQueue),
    new BullMQAdapter(investmentDLQ),
  ],
  serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`✅ Bull Board is running at http://localhost:${PORT}/admin/queues`)
);
