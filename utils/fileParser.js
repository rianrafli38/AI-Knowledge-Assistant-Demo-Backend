const mammoth = require("mammoth");

async function parseDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value || "";

  return cleanText(text);
}

function cleanText(text) {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function parseFile(file) {
  if (!file) throw new Error("No file provided");

  const mimetype = file.mimetype;

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return await parseDocx(file.buffer);
  }

  throw new Error("Unsupported file type. Use DOCX only.");
}

module.exports = { parseFile };