const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");

const { setSummary, getSummary } = require("./summaryCache"); // <-- ADD THIS

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

// Load chunks ...
async function getContextSamples(limit = 10) {
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

function buildSummaryPrompt(chunks) {
  return `
You are summarizing internal company documents for people.

Write a clear, concise summary that explains:
- what the document is about
- its main purpose
- key responsibilities
- important procedures or rules

Rules:
- Use professional, simple Indonesian language
- 1–2 short paragraphs
- No bullet points
- No markdown
- Do not invent information
- Make sure all details are accurate and based on the text
- Make it neat and easy to read

DOCUMENT CONTENT:
${chunks.join("\n\n")}
`;
}

exports.generateSummary = async () => {
  // 1) Check cache first
  const cached = getSummary();
  if (cached) {
    console.log("⚡ Summary returned from CACHE");
    return cached;
  }

  // 2) Otherwise generate fresh
  const chunks = await getContextSamples(10);

  if (!chunks.length) {
    return "No document content is available yet.";
  }

  const prompt = buildSummaryPrompt(chunks);

  const res = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      { role: "system", content: "You write concise professional summaries." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3
  });

  const summary = res.choices?.[0]?.message?.content || "Summary not available.";

  // 3) Save to cache
  setSummary(summary);

  console.log("✨ Summary regenerated and cached!");

  return summary;
};