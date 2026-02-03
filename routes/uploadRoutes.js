// routes/uploadRoutes.js
const express = require("express");
const router = express.Router();

const requireAdmin = require("../middlewares/requireAdmin");
const upload = require("../middlewares/upload");
const { uploadDocument } = require("../controllers/uploadController");

router.post(
  "/upload",
  requireAdmin,
  upload.single("file"),
  uploadDocument
);

module.exports = router;