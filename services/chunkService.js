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

  update("cleaning_text", 5);
  // PENTING: Jangan hapus tag [PAGE_X] di dalam cleanText milikmu ya!
  const text = cleanText(rawText).trim();

  update("splitting_paragraphs", 10);
  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const MAX = 900;
  const MIN = 25;
  let chunks = []; // SEKARANG BERISI OBJEK: { text: string, page: number }

  let currentPage = 1; // Default page tracker

  // REGEX untuk mendeteksi penanda halaman, misal: [PAGE_12]
  const pageRegex = /\[PAGE_(\d+)\]/i;

  paragraphs.forEach((p, idx) => {
    const percent = 10 + Math.round((idx / paragraphs.length) * 40);
    update("chunking_paragraphs", percent);

    // Cek apakah paragraf ini mengandung penanda halaman baru
    const match = p.match(pageRegex);
    if (match) {
      currentPage = parseInt(match[1], 10);
      p = p.replace(pageRegex, "").trim(); // Bersihkan tag-nya agar tidak ikut di-embed
    }

    if (p.length <= MAX) {
      if (p.length >= MIN) chunks.push({ text: p, page: currentPage });
      return;
    }

    // === long paragraph → split sentences ===
    const sentences = p.split(/(?<=[.!?])\s+/);
    let buffer = "";

    for (const s of sentences) {
      const next = buffer ? buffer + " " + s : s;
      if (next.length > MAX) {
        if (buffer.length >= MIN) chunks.push({ text: buffer.trim(), page: currentPage });
        buffer = s;
      } else {
        buffer = next;
      }
    }

    if (buffer.length >= MIN) chunks.push({ text: buffer.trim(), page: currentPage });
  });

  // =========================================
  // 4. MICRO WINDOW (Sesuaikan agar simpan halaman juga)
  // =========================================
  update("micro_window", 55);
  const micro = [];
  const W = 200;
  const O = 50;

  let pos = 0;
  let microPage = 1;

  while (pos < text.length) {
    const slice = text.slice(pos, pos + W).trim();
    
    // Deteksi halaman terdekat di slice micro window
    const match = slice.match(pageRegex);
    if (match) microPage = parseInt(match[1], 10);
    
    const cleanSlice = slice.replace(pageRegex, "").trim();

    if (cleanSlice.length >= MIN) {
      micro.push({ text: cleanSlice, page: microPage });
    }
    pos += W - O;
  }

  update("merging_chunks", 65);
  const all = [...chunks, ...micro];

  // Dedup objek berdasarkan teksnya
  const seen = new Set();
  const final = all.filter((item) => {
    const duplicate = seen.has(item.text);
    seen.add(item.text);
    return !duplicate;
  });

  update("finalizing", 75);
  const HARD_CAP = 180;
  const trimmed = final.slice(0, HARD_CAP);

  update("chunking_complete", 80);

  return trimmed; // Mengembalikan: Array<{ text: string, page: number }>
};