// controllers/uploadController.js
const { ingestDocx } = require("../services/ingestDocx");
const { ingestPdf } = require("../services/ingestPdf");
const { createJob } = require("../services/jobStore");
const path = require("path");

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File not found" });
    }

    // 1. Detect file type
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (![".docx", ".pdf"].includes(ext)) {
      return res.status(400).json({
        error: "Unsupported file type (currently only DOCX and PDF)",
      });
    }

    // 2. Create job
    const jobId = createJob({
      status: "starting",
      stage: "uploading",
      progress: 5,
      message: "File received",
    });

    // 3. Respond immediately
    res.json({ success: true, jobId });

    // 4. Background ingest (fire & forget)
    if (ext === ".docx") {
      ingestDocx(req.file.path, jobId)
        .catch(err => console.error("DOCX ingest failed:", err));
    } else if (ext === ".pdf") {
      ingestPdf(req.file.path, jobId)
        .catch(err => console.error("PDF ingest failed:", err));
    }

  } catch (err) {
    console.error("Upload controller error:", err);
    return res.status(500).json({ error: err.message });
  }
};