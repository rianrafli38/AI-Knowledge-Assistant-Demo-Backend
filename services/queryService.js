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
 * Bangun prompt RAG yang tidak kaku
 */
function buildPrompt(contextChunks, question) {
  const contextText = contextChunks
    .map((c, i) => `(${i + 1}) ${c.content}`)
    .join("\n\n");

  return `
You are an AI assistant that helps answer questions using internal company documents.

Use the information provided in the CONTEXT section as your primary source.
You may summarize or infer reasonable conclusions from the context, as long as they remain consistent with it.

If the answer is not explicitly stated but can be reasonably inferred, provide the best possible explanation.
If the information is truly not available, clearly say that it is not found in the provided documents.

====================
CONTEXT:
${contextText}
====================

QUESTION:
${question}

ANSWERING GUIDELINES:
- Respond in clear, professional English
- Be concise but informative
- Use bullet points if helpful
- Do NOT mention “the context”, “the document”, or similar phrases
- Do NOT invent facts
- Limit the answer to about 8–10 sentences
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