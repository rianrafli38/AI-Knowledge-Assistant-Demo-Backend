// services/suggestionService.js
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

/* ============================
   CORE QUESTIONS (stable anchors)
============================ */
const CORE_QUESTIONS = [
  "Apa saja tanggung jawab utama yang dijelaskan dalam dokumen ini?",
  "Prosedur apa yang harus diikuti?",
  "Siapa yang bertanggung jawab untuk implementasi?",
  "Aturan atau persyaratan apa yang berlaku?",
  "Dokumen atau persetujuan apa yang diperlukan?"
];

/* ============================
   Helpers
============================ */
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function extractJsonArray(text) {
  if (!text) return [];
  const match = text.match(/\[[\s\S]*?\]/);
  if (!match) return [];
  try {
    return JSON.parse(match[0]);
  } catch {
    return [];
  }
}

/* ============================
   Load document chunks
============================ */
async function getContextSamples(limit = 8) {
  const { data, error } = await supabase
    .from("documents")
    .select("content")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Supabase error:", error);
    return [];
  }

  return data.map(d => d.content);
}

/* ============================
   GROUNDED prompt builder
============================ */
function buildPrompt(chunks) {
  return `
You are given excerpts from internal documents.

Your task:
1. Extract concrete factual statements or rules that clearly appear in the text.
2. Convert each statement into a natural question that could be asked by an employee.

IMPORTANT RULES:
- Every question MUST be directly answerable from the text.
- Do NOT invent topics.
- Do NOT generalize beyond the content.
- Questions must closely match wording and meaning in the document.
- Output ONLY a JSON array of strings.
- 14 to 15 questions.

DOCUMENT CONTENT:
${chunks.join("\n\n")}
`;
}

/* ============================
   MAIN FUNCTION (GROUNDed HYBRID)
============================ */
exports.generateSuggestions = async () => {
  const chunks = await getContextSamples(8);

  if (!chunks.length) {
    return CORE_QUESTIONS;
  }

  let dynamicQuestions = [];

  try {
    const prompt = buildPrompt(chunks);

    const res = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You transform document statements into grounded user questions. Output only JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2
    });

    const text = res.choices?.[0]?.message?.content || "";
    dynamicQuestions = extractJsonArray(text);
  } catch (err) {
    console.warn("⚠️ Suggestion generation failed:", err.message);
  }

  // ambil sebagian agar tidak terlalu panjang
  const dynamicPicked = shuffle(dynamicQuestions).slice(0, 15);

  // gabungkan dengan pertanyaan inti
  const combined = [...CORE_QUESTIONS, ...dynamicPicked];

  // shuffle ringan agar tidak kaku
  return shuffle(combined);
};