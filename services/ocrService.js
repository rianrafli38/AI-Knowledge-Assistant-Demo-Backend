const { getWorker } = require("./ocr-Worker");

async function ocrImage(imagePath) {
  const worker = await getWorker();
  const { data } = await worker.recognize(imagePath);
  return data.text || "";
}

module.exports = { ocrImage };