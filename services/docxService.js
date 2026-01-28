const mammoth = require("mammoth");
const fs = require("fs");

exports.extractDocxText = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });

  return result.value || "";
};