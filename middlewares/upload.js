// middlewares/upload.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.endsWith(".docx")) {
    return cb(new Error("Only .docx allowed"));
  }
  cb(null, true);
};

module.exports = multer({ storage, fileFilter });