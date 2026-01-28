//  routes/suggestionRoutes.js
const express = require("express");
const { getSuggestions } = require("../controllers/suggestionController");

const router = express.Router();

router.get("/suggestions", getSuggestions);

module.exports = router;