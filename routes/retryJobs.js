const express = require("express");
const router = express.Router();

const { investmentDLQ, blockchainQueue } = require("../config/jobQueue");

router.get("/retry-dlq", async (req, res) => {
  try {
    // Fetch all jobs from the investmentDLQ queue (waiting, delayed, failed, etc.)
    const jobs = await investmentDLQ.getJobs(["waiting", "delayed", "failed"]);
    
    // If no jobs are present, return early
    if (jobs.length === 0) {
      return res.status(200).json({ success: true, message: "No jobs to retry." });
    }

    // Process each job
    for (const job of jobs) {
      try {
        console.log(`Retrying job ${job.id} with name ${job.name}`);

        // Add job to blockchainQueue
        await blockchainQueue.add(job.name, job.data);
        
        // Remove the job from DLQ after moving it to blockchainQueue
        await job.remove();
        
        console.log(`Job ${job.id} moved successfully to blockchainQueue.`);
      } catch (innerErr) {
        console.error(`❌ Failed to process job ${job.id}:`, innerErr);
        // Handle specific job error (log it or do any other action)
      }
    }

    res.status(200).json({ success: true, message: "Jobs moved successfully" });
  } catch (err) {
    console.error("❌ Error while moving jobs:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
