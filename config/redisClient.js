const Redis = require("ioredis");
const { default: Redlock } = require("redlock");
// Initialize Redis client
const client = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", () => {
  console.log("✅ Connected to Redis");
});

// Initialize Redlock
const redlock = new Redlock([client], {
  retryCount: 5,
  retryDelay: 200,
  retryJitter: 200,
});

// Optional: handle errors from redlock
redlock.on("error", (err) => {
  console.error("❌ Redlock Error:", err);
});

module.exports = {
  redisClient: client,
  redlock,
};
