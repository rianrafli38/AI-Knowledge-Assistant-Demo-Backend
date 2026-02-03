const { createWorker } = require("tesseract.js");

let worker = null;

async function getWorker() {
  if (!worker) {
    worker = await createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
  }
  return worker;
}

async function terminateWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

module.exports = {
  getWorker,
  terminateWorker
};