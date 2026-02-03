// services/ingestPipeline.js
const { chunkDocument, setJobProgressHook } = require("./chunkService");
const { embedAndStore } = require("./embeddingService");
const { logJob, updateJob } = require("./jobStore");
const { setSummary } = require("./summaryCache");

exports.runIngestPipeline = async ({
  text,
  source,
  type,
  jobId,
}) => {
  // ============================
  // CONNECT CHUNK PROGRESS HOOK
  // ============================
  setJobProgressHook((stage, percent) => {
    updateJob(jobId, { stage, progress: percent });
  });

  // ============================
  // 1. Chunking
  // ============================
  updateJob(jobId, { stage: "chunking", progress: 10 });
  logJob(jobId, "Memulai chunking...");

  const chunks = chunkDocument(text, jobId);

  updateJob(jobId, {
    stage: "chunking_complete",
    progress: 80,
  });

  logJob(jobId, `Chunking selesai → ${chunks.length} chunk`);

  // ============================
  // 2. Embedding
  // ============================
  updateJob(jobId, { stage: "embedding_vectors", progress: 85 });
  logJob(jobId, "Embedding chunk ke database Supabase");

  await embedAndStore(chunks, {
    source,
    type,
    jobId,
  });

  updateJob(jobId, {
    stage: "embedding_complete",
    progress: 95,
  });

  // ============================
  // 3. Reset Summary Cache
  // ============================
  setSummary(null);
  logJob(jobId, "Summary cache sudah di-reset");

  // ============================
  // 4. Finalization
  // ============================
  updateJob(jobId, {
    stage: "done",
    progress: 100,
  });

  logJob(jobId, "Ingest proses selesai");
};