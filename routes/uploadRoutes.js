// routes/uploadRoutes.js
const express = require("express");
const router = express.Router();

const requireAdmin = require("../middlewares/requireAdmin");
const upload = require("../middlewares/upload");
const { uploadDocx } = require("../controllers/uploadController");

router.post("/upload", requireAdmin, upload.single("file"), uploadDocx);


module.exports = router;