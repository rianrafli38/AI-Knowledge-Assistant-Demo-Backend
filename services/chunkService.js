// services/chunkService.js
const { cleanText } = require("./textCleaner");

let jobProgress = null;
exports.setJobProgressHook = (fn) => (jobProgress = fn);

function update(stage, percent) {
  if (jobProgress) jobProgress(stage, percent);
}

/**
 * CHUNK ENGINE v2026 — FAST, LEAN, ACCURATE
 * - No massive sliding-window
 * - Sentence-based chunking
 * - Micro windows for contextual safety
 * - Hard chunk cap for fast embedding
 */
exports.chunkDocument = (rawText) => {
  if (!rawText || typeof rawText !== "string") return [];

  // =========================================
  // 1. CLEANING TEXT
  // =========================================
  update("cleaning_text", 5);
  const text = cleanText(rawText).trim();

  // =========================================
  // 2. PARAGRAPH SPLITTING
  // =========================================
  update("splitting_paragraphs", 10);
  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const MAX = 900;
  const MIN = 25;
  let chunks = [];

  // =========================================
  // 3. MAIN PARAGRAPH CHUNKING
  // =========================================
  paragraphs.forEach((p, idx) => {
    const percent = 10 + Math.round((idx / paragraphs.length) * 40);
    update("chunking_paragraphs", percent);

    // === short paragraph ===
    if (p.length <= MAX) {
      if (p.length >= MIN) chunks.push(p);
      return;
    }

    // === long paragraph → split sentences ===
    const sentences = p.split(/(?<=[.!?])\s+/);
    let buffer = "";

    for (const s of sentences) {
      const next = buffer ? buffer + " " + s : s;
      if (next.length > MAX) {
        if (buffer.length >= MIN) chunks.push(buffer.trim());
        buffer = s;
      } else {
        buffer = next;
      }
    }

    if (buffer.length >= MIN) chunks.push(buffer.trim());
  });

  // =========================================
  // 4. MICRO WINDOW (small overlap, not explosion)
  // =========================================
  update("micro_window", 55);

  const micro = [];
  const W = 200;
  const O = 50;

  let pos = 0;
  while (pos < text.length) {
    const slice = text.slice(pos, pos + W).trim();
    if (slice.length >= MIN) micro.push(slice);
    pos += W - O;
  }

  // =========================================
  // 5. MERGE & DEDUP
  // =========================================
  update("merging_chunks", 65);

  const all = [...chunks, ...micro];

  // Dedup fastest way
  const final = Array.from(new Set(all));

  // =========================================
  // 6. HARD LIMIT (keep system fast)
  // =========================================
  update("finalizing", 75);

  const HARD_CAP = 180;
  const trimmed = final.slice(0, HARD_CAP);

  update("chunking_complete", 80);

  return trimmed;
};