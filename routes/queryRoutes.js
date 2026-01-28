const express = require("express");
const { queryDocs } = require("../controllers/queryController");

const router = express.Router();

router.post("/query", queryDocs);

module.exports = router;