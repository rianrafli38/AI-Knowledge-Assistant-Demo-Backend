// services/ocr-Worker.js
const { createWorker } = require("tesseract.js");

const MAX_WORKERS = 2; // ⚠️ aman dulu, bisa naik nanti

const workers = [];
const idleWorkers = [];
const queue = [];

async function createNewWorker() {
  const worker = await createWorker("eng");
  return worker;
}

async function initPool() {
  while (workers.length < MAX_WORKERS) {
    const worker = await createNewWorker();
    workers.push(worker);
    idleWorkers.push(worker);
  }
}

// ambil worker atau antri
function acquireWorker() {
  return new Promise((resolve) => {
    if (idleWorkers.length > 0) {
      return resolve(idleWorkers.pop());
    }
    queue.push(resolve);
  });
}

// kembalikan worker ke pool
function releaseWorker(worker) {
  if (queue.length > 0) {
    const next = queue.shift();
    next(worker);
  } else {
    idleWorkers.push(worker);
  }
}

async function ocrImage(imagePath) {
  if (workers.length === 0) {
    await initPool();
  }

  const worker = await acquireWorker();

  try {
    const { data } = await worker.recognize(imagePath);
    return data.text || "";
  } finally {
    releaseWorker(worker);
  }
}

async function terminateAll() {
  for (const w of workers) {
    await w.terminate();
  }
  workers.length = 0;
  idleWorkers.length = 0;
  queue.length = 0;
}

module.exports = {
  ocrImage,
  terminateAll
};