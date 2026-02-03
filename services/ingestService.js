// services/ingestService.js
const { extractDocxText } = require("./docxService");
const { logJob, updateJob } = require("./jobStore");
const { runIngestPipeline } = require("./ingestPipeline");

exports.ingestDocx = async (filePath, jobId) => {
  try {
    // ============================
    // 1. Extract DOCX
    // ============================
    updateJob(jobId, { stage: "extracting_text", progress: 5 });
    logJob(jobId, "Membaca file DOCX");

    const rawText = await extractDocxText(filePath);

    // ============================
    // 2. Run shared pipeline
    // ============================
    await runIngestPipeline({
      text: rawText,
      source: filePath,
      type: "docx",
      jobId,
    });

  } catch (err) {
    console.error("❌ ingestDocx error:", err);
    updateJob(jobId, {
      stage: "error",
      error: err.message,
      progress: 0,
    });
    throw err;
  }
};