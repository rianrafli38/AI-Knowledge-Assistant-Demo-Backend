const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

function pdfToImages(pdfPath) {
  return new Promise((resolve, reject) => {
    const outputDir = pdfPath.replace(".pdf", "_pages");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const outputPrefix = path.join(outputDir, "page");

    // poppler native tool
    const cmd = `pdftoppm -png "${pdfPath}" "${outputPrefix}"`;

    exec(cmd, (err) => {
      if (err) return reject(err);

      const files = fs
        .readdirSync(outputDir)
        .filter(f => f.endsWith(".png"))
        .sort((a, b) => {
          const na = parseInt(a.match(/\d+/)?.[0] || 0);
          const nb = parseInt(b.match(/\d+/)?.[0] || 0);
          return na - nb;
        })
        .map(f => path.join(outputDir, f));

      resolve(files);
    });
  });
}

module.exports = { pdfToImages };