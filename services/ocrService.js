// services/ocrService.js
import { getWorker } from "./ocr-Worker.js";

export async function ocrImage(imagePath) {
  const worker = await getWorker();
  const { data } = await worker.recognize(imagePath);
  return data.text || "";
}L