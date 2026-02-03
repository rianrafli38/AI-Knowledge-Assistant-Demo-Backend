//` routes/jobs.js
const express = require("express");
const router = express.Router();
const { getJob } = require("../services/jobStore");

router.get("/:jobId", (req, res) => {
  try {
    const job = getJob(req.params.jobId);

    if (!job) {
      return res.status(200).json({
        stage: "error",
        progress: 0,
        error: "Job expired or server restarted"
      });
    }

    res.json(job);
  } catch (err) {
    console.error("❌ Job route error:", err);
    res.status(200).json({
      stage: "error",
      progress: 0,
      error: "Internal job fetch error"
    });
  }
});

module.exports = router;