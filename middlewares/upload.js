// middlewares/upload.js
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// ============================
// STORAGE CONFIG
// ============================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = crypto.randomUUID();
    cb(null, `${id}${ext}`);
  }
});

// ============================
// FILE FILTER
// ============================
const ALLOWED_EXTENSIONS = [".docx", ".pdf"];
const ALLOWED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf"
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (
    !ALLOWED_EXTENSIONS.includes(ext) ||
    !ALLOWED_MIME_TYPES.includes(mime)
  ) {
    return cb(
      new Error("Unsupported file type. Only .docx files are allowed."),
      false
    );
  }

  cb(null, true);
};

// ============================
// MULTER INSTANCE
// ============================
module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB (aman untuk SOP)
  }
});