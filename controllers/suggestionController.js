// controllers/suggestionController.js
const { generateSuggestions } = require("../services/suggestionService");

exports.getSuggestions = async (req, res) => {
  try {
    const questions = await generateSuggestions();

    res.json({
      success: true,
      suggestions: questions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};