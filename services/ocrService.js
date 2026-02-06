// services/ocrService.js
const { ocrImage } = require("./ocr-Worker");

/**
 * OCR satu gambar
 * Worker management ditangani sepenuhnya oleh ocrWorker (pool)
 */
async function runOcr(imagePath) {
  return await ocrImage(imagePath);
}

module.exports = {
  ocrImage: runOcr
};