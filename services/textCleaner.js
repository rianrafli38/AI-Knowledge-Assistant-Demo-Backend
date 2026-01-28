// services/textCleaner.js

exports.cleanText = (text) => {
  return text
    // Remove carriage returns & invisible chars
    .replace(/\r/g, "")
    .replace(/[\u200B-\u200F\uFEFF]/g, "") // zero width chars
    .replace(/�/g, "") // unknown char block from PDF

    // Normalize bullet points
    .replace(/[•●▪◦◆►▸➤➡→]/g, "-")

    // Remove repeated bullets / dashes
    .replace(/-{3,}/g, "-")
    .replace(/_{3,}/g, "_")

    // Remove repeated punctuation
    .replace(/[.]{4,}/g, ".")
    .replace(/[,]{3,}/g, ",")
    .replace(/[!]{3,}/g, "!")
    .replace(/[?]{3,}/g, "?")

    // Remove page headers/footers
    .replace(/page\s+\d+\s+of\s+\d+/gi, "")
    .replace(/halaman\s+\d+/gi, "")
    .replace(/(confidential|rahasia)/gi, "")

    // Remove leftover numbering formats
    .replace(/\n\d+\.\s/g, "\n- ")
    .replace(/\n\d+\)\s/g, "\n- ")

    // Collapse multiple spaces & tabs
    .replace(/[ \t]{2,}/g, " ")

    // Collapse excessive newlines
    .replace(/\n{3,}/g, "\n\n")

    .trim();
};