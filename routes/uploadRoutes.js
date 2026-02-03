const express = require("express");
const router = express.Router();

const requireAdmin = require("../middlewares/requireAdmin");
const upload = require("../middlewares/upload");
const { uploadDocument } = require("../controllers/uploadController");

// ✅ PRE-FLIGHT — HARUS PALING ATAS
router.options("/upload", (req, res) => {
  res.sendStatus(204);
});

// ✅ ACTUAL UPLOAD
router.post(
  "/upload",
  requireAdmin,
  upload.single("file"),
  uploadDocument
);

module.exports = router;