// middlewares/upload.js
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const UPLOAD_DIR = "/tmp/uploads";

// 🔑 pastikan folder ADA sebelum multer dipakai
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  }
});

const ALLOWED_EXTENSIONS = [".docx", ".pdf"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  console.log("📥 Upload attempt:", file.originalname, file.mimetype);

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    console.error("❌ Blocked extension:", ext);
    return cb(new Error("Unsupported file type"), false);
  }

  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});