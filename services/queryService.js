const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");

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

/**
 * Cari konteks relevan dari Supabase
 */
async function retrieveContext(question, k = 5) {
  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question
  });

  if (!emb.data?.length) {
    throw new Error("Embedding gagal dibuat.");
  }

  const embedding = emb.data[0].embedding;

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_count: k
  });

  if (error) throw error;

  return data || [];
}

/**
 * Bangun prompt RAG dengan Chain of Thought dan Sitasi Hukum Ketat
 */
function buildPrompt(contextChunks, question) {
  const contextText = contextChunks
    .map((c, i) => {
      const sourceName = c.file_name || c.title || "Dokumen Referensi";
      const content = (c.content || "").trim();

      return `[SUMBER ${i + 1}: ${sourceName}]
${content}`;
    })
    .join("\n\n---\n\n");

  return `
Kamu adalah seorang Corporate Legal Expert dan Partner Hukum Senior di Indonesia.

Tugasmu adalah memberikan legal opinion yang akurat berdasarkan dokumen yang diberikan.

====================
KONTEKS DOKUMEN
====================

${contextText}

====================
PERTANYAAN
====================

${question}

INSTRUKSI:

- Analisis pertanyaan secara menyeluruh sebelum menjawab.
- Gunakan HANYA informasi yang terdapat pada dokumen di atas.
- Jangan menggunakan pengetahuan di luar dokumen.
- Setiap kesimpulan HARUS menyebutkan sumbernya.

Format sitasi:

(Pasal 5 ayat (2) [UU Nomor 40 Tahun 2007] - SUMBER 2)

Jika informasi tidak ditemukan dalam dokumen, katakan dengan tegas bahwa informasi tersebut tidak tersedia pada dokumen referensi.

Jangan tampilkan proses berpikir atau reasoning internal. Tampilkan hanya hasil analisis akhir yang runtut, profesional, dan mudah dipahami.
`;
}

/**
 * MAIN QUERY FUNCTION
 */
exports.runQuery = async (question) => {
  const contexts = await retrieveContext(question, 5);

  if (!contexts.length) {
    return "Maaf, saya tidak menemukan informasi yang relevan dalam dokumen.";
  }

  const prompt = buildPrompt(contexts, question);

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      { role: "user", content: prompt }
    ],
    temperature: 0.3
  });

  return completion.choices[0].message.content;
};