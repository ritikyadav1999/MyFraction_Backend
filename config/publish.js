const { Redis } = require("ioredis");

const redis = new Redis();

function publish(data) {
  redis
    .publish("createInvestmentOnBlockChain", JSON.stringify(data))
    .then((result) => {
      console.log("Result: ", result);
      redis.quit();
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
}

module.exports = { publish };
