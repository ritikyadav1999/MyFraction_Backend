// config/arena.js
const Arena = require("bull-arena");
const express = require("express")
const router = express();
const { Queue } = require("bullmq");
const redisClient = require("./redisClient");

const arena = Arena(
  {
    BullMQ: Queue,
    queues: [
      {
        name: "investmentQueue",
        type: "bullmq",
        connection: redisClient,
      },
    ],
  },
  {
    basePath: "/admin/arena",  // Arena dashboard path
    disableListen: false,      // Enable real-time updates in the dashboard
  }
);


module.exports = arena;
