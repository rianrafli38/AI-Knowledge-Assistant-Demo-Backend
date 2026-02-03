// services/pdfService.js
const { convert } = require("pdf-poppler");
const fs = require("fs");
const path = require("path");

async function pdfToImages(pdfPath) {
  const outputDir = pdfPath.replace(".pdf", "_pages");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  await convert(pdfPath, {
    format: "png",
    out_dir: outputDir,
    out_prefix: "page",
    page: null,
  });

  return fs
    .readdirSync(outputDir)
    .filter(f => f.endsWith(".png"))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] || 0);
      const nb = parseInt(b.match(/\d+/)?.[0] || 0);
      return na - nb;
    })
    .map(f => path.join(outputDir, f));
}

module.exports = { pdfToImages };