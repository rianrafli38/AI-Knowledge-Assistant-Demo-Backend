import { convert } from "pdf-poppler";
import fs from "fs";
import path from "path";

export async function pdfToImages(pdfPath) {
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
    .map(f => path.join(outputDir, f));
}