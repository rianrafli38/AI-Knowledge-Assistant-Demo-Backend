// routes/overviewRoutes.js
const express = require("express");
const { getOverview } = require("../controllers/overviewController");

const router = express.Router();

router.get("/overview", getOverview);

module.exports = router;