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

  const embedding = emb.data[0].embedding;

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_count: k
  });

  if (error) throw error;

  return data;
}

/**
 * Bangun prompt RAG dengan Chain of Thought dan Sitasi Hukum Ketat
 */
function buildPrompt(contextChunks, question) {
  // Menggabungkan konten dengan menyuntikkan nama file asli (source) dan nomor halaman (page_number)
  const contextText = contextChunks
    .map((c) => {
      // Ambil dari properti 'source' yang sudah berisi nama file asli, dan 'page_number'
      const docName = c.source || "Dokumen Referensi";
      const pageNum = c.page_number && c.page_number !== 0 ? `Halaman ${c.page_number}` : "Halaman tidak tertera";
      
      return `[DOKUMEN: ${docName} | ${pageNum}]\n${c.content}`;
    })
    .join("\n\n---\n\n");

  return `
Kamu adalah seorang Corporate Legal Expert dan Partner Hukum Senior di Indonesia yang sangat teliti, kritis, dan berbasis data. Tugasmu adalah menganalisis dokumen hukum dan menjawab pertanyaan pengguna dengan standar legal opinion yang tinggi.

====================
KONTEKS DOKUMEN:
${contextText}
====================

PERTANYAAN:
${question}

PROSES BERPIKIR (CHAIN OF THOUGHT):
Sebelum memberikan jawaban akhir, kamu WAJIB melakukan penalaran hukum secara internal dengan langkah berikut:
1. Identifikasi inti masalah hukum dari PERTANYAAN.
2. Cari klausul, undang-undang, nomor peraturan, pasal, dan ayat yang relevan di dalam KONTEKS DOKUMEN.
3. Hubungkan logika antara aturan hukum tersebut dengan fakta yang ditanyakan.
4. Tuliskan analisis hukum secara runut sebelum menyimpulkan.

PANDUAN MENJAWAB (ANSWERING GUIDELINES):
- JAWABAN MENDALAM & KOMPREHENSIF: Jangan memberikan jawaban ringkas, umum, atau normatif. Bedah setiap aspek hukum secara mendetail dan tajam.
- SITASI HUKUM MUTLAK & KETAT: Setiap argumen, pasal, atau ayat yang kamu sebutkan WAJIB menyertakan dari dokumen mana informasi tersebut diambil berdasarkan tag DOKUMEN dan HALAMAN yang tertera di konteks.
  *DILARANG KERAS menggunakan label generik buatan sendiri seperti "[Sumber 1]", "[Sumber 2]", atau "[Sumber Z]".*
  Contoh format sitasi yang benar: "...berdasarkan Pasal X Ayat Y (Nama_Undang_Undang.pdf, Halaman Z)..."
- DETEKSI RISIKO & MITIGASI: Jika ada indikasi celah hukum, breakdown potensi kerugian, sanksi, atau risiko litigasi secara tajam, lalu berikan saran mitigasinya.
- JIKA TIDAK ADA DI KONTEKS: Jika dokumen tidak memuat informasi spesifik yang dicari, katakan dengan tegas bahwa informasi tersebut tidak ditemukan dalam dokumen referensi yang tersedia. Jangan berasumsi atau membuat analogi hukum sendiri.
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
