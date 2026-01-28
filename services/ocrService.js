import { createWorker } from "tesseract.js";

export async function ocrImage(imagePath) {
  const worker = await createWorker("eng");

  const { data } = await worker.recognize(imagePath);

  await worker.terminate();

  return data.text || "";
}