const { Redis } = require("ioredis");

const redis = new Redis();

function startSubscriber() {
  redis.subscribe("createInvestmentOnBlockChain", (err, count) => {
    if (err) {
      console.error("Error while subscribing:", err);
    } else {
      console.log(`Successfully subscribed to ${count} channel(s)`);
    }
  });

  redis.on("message", (channel, data) => {
    if (channel === "createInvestmentOnBlockChain") {
      data = JSON.parse(data);
      console.log(data);
    }
  });
}

module.exports = { startSubscriber };
