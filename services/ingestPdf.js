// services/ingestPdf.js
const { pdfToImages } = require("./pdfService");
const { ocrImage } = require("./ocrService");
const { logJob, updateJob } = require("./jobStore");
const { runIngestPipeline } = require("./ingestPipeline");

exports.ingestPdf = async (filePath, jobId) => {
  try {
    updateJob(jobId, { stage: "extracting_text", progress: 5 });
    logJob(jobId, "Konversi PDF ke image");

    const images = await pdfToImages(filePath);

    let combinedText = "";

    for (let i = 0; i < images.length; i++) {
      const percent = 5 + Math.floor((i / images.length) * 40);
      updateJob(jobId, { stage: "ocr_processing", progress: percent });

      logJob(jobId, `OCR page ${i + 1}/${images.length}`);
      const text = await ocrImage(images[i]);
      combinedText += "\n" + text;
    }

    await runIngestPipeline({
      text: combinedText,
      source: filePath,
      type: "pdf_ocr",
      jobId,
    });

  } catch (err) {
    console.error("❌ ingestPdf error:", err);
    updateJob(jobId, {
      stage: "error",
      error: err.message,
      progress: 0,
    });
    throw err;
  }
};