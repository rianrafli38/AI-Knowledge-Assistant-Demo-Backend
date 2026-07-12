// services/embeddingService.js
const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");
const retry = require("../utils/retry");

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost",
    "X-Title": "AI Training Assistant",
  },
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================
// CONFIG
// ============================
const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL || "text-embedding-3-small";

const BATCH_SIZE = 80;
const MAX_CONCURRENT = 3;

// ============================
// EMBED BATCH
// ============================
async function embedBatch(batch) {
  if (!batch.length) return [];

  const res = await retry(() =>
    openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    })
  );

  return res.data.map((d) => d.embedding);
}

// ============================
// MAIN SERVICE
// ============================
// Cukup ubah di fungsi MAIN SERVICE ini, kawan:
exports.embedAndStore = async (chunks, meta = {}) => {
  if (!Array.isArray(chunks) || chunks.length === 0) return;

  // 1. SPLIT INTO BATCHES
  const batches = [];
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    batches.push(chunks.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 Total embedding batches: ${batches.length}`);

  let index = 0;

  async function worker(workerId) {
    while (index < batches.length) {
      const batchIndex = index++;
      const batch = batches[batchIndex];

      console.log(`⚡ Worker ${workerId} embedding batch ${batchIndex + 1}/${batches.length}`);

      // Ekstrak teks mentahnya saja untuk dikirim ke OpenAI API
      const textInputs = batch.map(c => c.text);
      const embeddings = await embedBatch(textInputs);

      // Map rows dengan metadata halaman dinamis per chunk!
      const rows = batch.map((chunkObj, i) => ({
        content: chunkObj.text,          // teks asli
        embedding: embeddings[i],       // vektor matematika
        source: meta.source || "docx",
        type: meta.type || "manual",
        job_id: meta.jobId || null,
        created_at: new Date(),
        // PENTING: Tambahkan kolom ini di tabel Supabase-mu (atau masukkan ke kolom JSON metadata)
        page_number: chunkObj.page       
      }));

      const res = await retry(() =>
        supabase.from("documents").insert(rows)
      );

      if (res.error) {
        console.error("❌ Supabase insert failed:", res.error);
        throw res.error;
      }
    }
  }

  const workers = [];
  for (let i = 1; i <= MAX_CONCURRENT; i++) {
    workers.push(worker(i));
  }

  await Promise.all(workers);
  console.log("✅ Embedding & storage completed dengan sukses!");
};