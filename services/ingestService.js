// services/ingestService.js
const { extractDocxText } = require("./docxService");
const { chunkDocument, setJobProgressHook } = require("./chunkService");
const { embedAndStore } = require("./embeddingService");
const { logJob, updateJob } = require("./jobStore");
const { setSummary } = require("./summaryCache");

exports.ingestDocx = async (filePath, jobId) => {
  try {
    // ============================
    // CONNECT CHUNK PROGRESS HOOK
    // ============================
    setJobProgressHook((stage, percent) => {
      updateJob(jobId, { stage, progress: percent });
    });

    // ============================
    // 1. Extract DOCX
    // ============================
    updateJob(jobId, { stage: "extracting_text", progress: 5 });
    logJob(jobId, "Membaca file DOCX");

    const rawText = await extractDocxText(filePath);

    // ============================
    // 2. Chunking
    // ============================
    updateJob(jobId, { stage: "chunking", progress: 10 });
    logJob(jobId, "Memulai chunking...");

    const chunks = chunkDocument(rawText, jobId);

    updateJob(jobId, {
      stage: "chunking_complete",
      progress: 80
    });

    logJob(jobId, `Chunking selesai → ${chunks.length} chunk`);

    // ============================
    // 3. Embedding
    // ============================
    updateJob(jobId, { stage: "embedding_vectors", progress: 85 });
    logJob(jobId, "Embedding chunk ke database Supabase");

    await embedAndStore(chunks, {
      source: filePath,
      type: "docx",
      jobId,
    });

    updateJob(jobId, {
      stage: "embedding_complete",
      progress: 95,
    });

    // ============================
    // 4. Reset Summary Cache
    // ============================
    setSummary(null);
    logJob(jobId, "Summary cache sudah di-reset");

    // ============================
    // 5. Finalization
    // ============================
    updateJob(jobId, {
      stage: "done",
      progress: 100,
    });

    logJob(jobId, "Ingest proses selesai");

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