// controllers/overviewController.js
const { generateSummary } = require("../services/summaryService");
const { generateSuggestions } = require("../services/suggestionService");

exports.getOverview = async (req, res) => {
  try {
    const [summary, suggestions] = await Promise.all([
      generateSummary(),
      generateSuggestions()
    ]);

    res.json({
      success: true,
      summary,
      suggestions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate overview" });
  }
};