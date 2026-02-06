// services/pdfService.js
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function pdfToImages(pdfPath) {
  return new Promise((resolve, reject) => {
    const { dir, name } = path.parse(pdfPath);
    const outputDir = path.join(dir, `${name}_pages`);

    // pastikan folder ada
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPrefix = path.join(outputDir, "page");

    // gunakan spawn (AMAN untuk file besar)
    const proc = spawn("pdftoppm", [
      "-png",
      pdfPath,
      outputPrefix
    ]);

    proc.on("error", (err) => {
      reject(err);
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`pdftoppm exited with code ${code}`)
        );
      }

      try {
        const files = fs
          .readdirSync(outputDir)
          .filter(f => f.endsWith(".png"))
          .sort((a, b) => {
            const na = parseInt(a.match(/\d+/)?.[0] || 0);
            const nb = parseInt(b.match(/\d+/)?.[0] || 0);
            return na - nb;
          })
          .map(f => path.join(outputDir, f));

        if (!files.length) {
          return reject(
            new Error("No images generated from PDF")
          );
        }

        resolve(files);
      } catch (err) {
        reject(err);
      }
    });
  });
}

module.exports = { pdfToImages };