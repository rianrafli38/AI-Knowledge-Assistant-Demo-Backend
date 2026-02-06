// services/pdfTextService.js
const { exec } = require("child_process");

/**
 * Extract text langsung dari PDF (tanpa OCR)
 * Menggunakan poppler `pdftotext`
 *
 * Return:
 * - string text (trimmed)
 * - empty string kalau tidak ada text
 */
function extractPdfText(pdfPath) {
  return new Promise((resolve, reject) => {
    const cmd = `pdftotext "${pdfPath}" -`; 
    // "-" = output ke stdout, tidak bikin file

    exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
      if (err) {
        // ⚠️ jangan reject keras — ini hanya “attempt”
        console.warn("⚠️ pdftotext failed, fallback to OCR");
        return resolve("");
      }

      const text = stdout
        .replace(/\s+/g, " ")
        .trim();

      resolve(text);
    });
  });
}

module.exports = {
  extractPdfText
};