// controllers/uploadController.js
const { ingestDocx } = require("../services/ingestService");
const { createJob } = require("../services/jobStore");

exports.uploadDocx = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File not found" });
    }

    // 1. Generate job
    const jobId = createJob({
      status: "starting",
      step: "uploading",
      progress: 5,
      message: "File received"
    });

    // 2. Return jobId immediately
    res.json({ success: true, jobId });

    // 3. Continue processing in background (no await!)
    ingestDocx(req.file.path, jobId);

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message });
  }
};