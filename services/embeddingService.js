// services/embeddingService.js
const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");
const retry = require("../utils/retry");

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost",
    "X-Title": "AI Training Assistant"
  }
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// OPTIMAL batch size for OpenAI embeddings
const BATCH_SIZE = 80;

// MAX parallel workers
const MAX_CONCURRENT = 3;

async function embedBatch(batch) {
  const res = await retry(() =>
    openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch
    })
  );
  return res.data.map(d => d.embedding);
}

exports.embedAndStore = async (chunks, meta = {}) => {
  if (!chunks?.length) return;

  // 1) SPLIT into batches
  const batches = [];
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    batches.push(chunks.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 Total batches: ${batches.length}`);

  // 2) PARALLEL worker pool
  let index = 0;
  const allRows = [];

  async function worker(id) {
    while (index < batches.length) {
      const i = index++;
      const batch = batches[i];

      console.log(`⚡ Worker ${id} embedding batch ${i + 1}/${batches.length}`);

      const embeddings = await embedBatch(batch);

      // Simpan sementara di memory
      batch.forEach((text, idx) => {
        allRows.push({
          content: text,
          embedding: embeddings[idx],
          source: meta.source || "docx",
          type: meta.type || "manual",
          created_at: new Date()
        });
      });
    }
  }

  // Start workers
  const workers = [];
  for (let w = 1; w <= MAX_CONCURRENT; w++) {
    workers.push(worker(w));
  }

  await Promise.all(workers);

  console.log(`🧩 Total embeddings generated: ${allRows.length}`);

  // 3) BULK INSERT once
  console.log("💾 Saving to Supabase (bulk insert)…");

  const insertRes = await retry(() =>
    supabase.from("documents").insert(allRows, { count: "exact" })
  );

  if (insertRes.error) {
    console.error("❌ Supabase insert failed:", insertRes.error);
  } else {
    console.log(`✅ Stored ${allRows.length} rows to Supabase`);
  }
};