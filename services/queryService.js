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
async function retrieveContext(question, k = 7) {
  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question
  });

  const embedding = emb.data[0].embedding;

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_count: k
  });

  if (error) throw error;

  return data;
}

/**
 * Bangun prompt RAG yang tidak kaku
 */
function buildPrompt(contextChunks, question) {
  const contextText = contextChunks
    .map((c, i) => `(${i + 1}) ${c.content}`)
    .join("\n\n");

  return `
Kamu adalah seorang Corporate Legal Expert dan Partner Hukum Senior yang sangat teliti, kritis, dan berbasis data. 

Tugasmu adalah menganalisis dokumen hukum yang diberikan melalui konteks dan menjawab pertanyaan pengguna dengan standar profesional yang tinggi.

====================
CONTEXT:
${contextText}
====================

QUESTION:
${question}

ANSWERING GUIDELINES:
- JAWABAN MENDALAM & SPESIFIK: Jangan memberikan jawaban umum atau ringkas. Bedah setiap poin masalah secara komprehensif.
- BERBASIS BUKTI (DOCK-BASED): Setiap argumen atau analisis yang kamu berikan WAJIB merujuk langsung pada nomor pasal, ayat, nama klausul, atau bagian spesifik yang ada di dalam dokumen konteks.
- DETEKSI RISIKO: Jika pertanyaan menanyakan tentang risiko atau implikasi, breakdown potensi kerugian atau celah hukumnya secara tajam.
- JIKA TIDAK ADA: Jika informasi yang ditanyakan tidak tercantum di dalam dokumen konteks, katakan dengan tegas bahwa informasi tersebut tidak ditemukan di dalam berkas terkait, jangan berasumsi atau mengarang.
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