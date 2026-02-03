// services/ocrWorker.js
import { createWorker } from "tesseract.js";

let worker;

export async function getWorker() {
  if (!worker) {
    worker = await createWorker({
      logger: () => {} // optional
    });
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
  }
  return worker;
}

export async function terminateWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}