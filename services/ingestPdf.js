// services/ingestPdf.js
const path = require("path");
const { extractPdfText } = require("./pdfTextService"); // text-based PDF
const { pdfToImages } = require("./pdfService");        // image conversion
const { ocrImage } = require("./ocrService");

const { logJob, updateJob } = require("./jobStore");
const { runIngestPipeline } = require("./ingestPipeline");

const MIN_TEXT_THRESHOLD = 500; // karakter minimum dianggap "text-based"

exports.ingestPdf = async (filePath, jobId, originalName) => {
  try {
    // ============================
    // 1️⃣ Try TEXT extraction first
    // ============================
    updateJob(jobId, { stage: "detecting_pdf_type", progress: 5 });
    logJob(jobId, "Mendeteksi jenis PDF (text vs scan)");

    let extractedText = "";
    let usedOCR = false;

    try {
      extractedText = await extractPdfText(filePath);
    } catch (err) {
      console.warn("⚠️ PDF text extract failed, fallback OCR");
    }

    // ============================
    // 2️⃣ If text-based → skip OCR
    // ============================
    if (extractedText && extractedText.length >= MIN_TEXT_THRESHOLD) {
      logJob(jobId, "PDF terdeteksi sebagai text-based, OCR dilewati");
      updateJob(jobId, { stage: "text_extracted", progress: 25 });
    } else {
      // ============================
      // 3️⃣ Fallback to OCR
      // ============================
      usedOCR = true;
      logJob(jobId, "PDF scan terdeteksi, menjalankan OCR");

      updateJob(jobId, {
        stage: "converting_pdf_to_images",
        progress: 10,
      });

      const images = await pdfToImages(filePath);
      let combinedText = "";

      for (let i = 0; i < images.length; i++) {
        const percent = 10 + Math.floor((i / images.length) * 50);

        updateJob(jobId, {
          stage: "ocr_processing",
          progress: percent,
        });

        logJob(jobId, `OCR halaman ${i + 1}/${images.length}`);
        const text = await ocrImage(images[i]);
        // Sisipkan penanda halaman di awal teks hasil OCR tiap halaman
        combinedText += `\n[PAGE_${i + 1}]\n` + text;

      }

      extractedText = combinedText;
    }

    // ============================
    // 4️⃣ Ingest pipeline
    // ============================
    updateJob(jobId, {
      stage: "embedding_documents",
      progress: usedOCR ? 65 : 40,
    });

    logJob(jobId, "Menjalankan ingestion pipeline");

    await runIngestPipeline({
      text: extractedText,
      source: originalName || path.basename(filePath),
      type: usedOCR ? "pdf_ocr" : "pdf_text",
      jobId,
    });

    // ============================
    // 5️⃣ Done
    // ============================
    updateJob(jobId, {
      stage: "done",
      progress: 100,
    });

    logJob(jobId, "PDF berhasil diproses");

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