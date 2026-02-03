// middlewares/upload.js
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

// ============================
// ENSURE UPLOAD DIR EXISTS
// ============================
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log("📁 Created uploads directory");
}

// ============================
// STORAGE CONFIG
// ============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = crypto.randomUUID();
    cb(null, `${id}${ext}`);
  },
});

// ============================
// FILE FILTER
// ============================
const ALLOWED_EXTENSIONS = [".docx", ".pdf"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  console.log("📥 Incoming file:", {
    name: file.originalname,
    mime: file.mimetype,
    ext,
  });

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    console.error("❌ Rejected file extension:", ext);
    return cb(new Error("Unsupported file extension"), false);
  }

  cb(null, true);
};

// ============================
// MULTER INSTANCE
// ============================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = upload;