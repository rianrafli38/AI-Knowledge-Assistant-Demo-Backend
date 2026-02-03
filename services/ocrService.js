// services/ocrService.js
const { getWorker } = require("./ocrWorker");

async function ocrImage(imagePath) {
  const worker = await getWorker();
  const { data } = await worker.recognize(imagePath);
  return data.text || "";
}

module.exports = { ocrImage };