const { runQuery } = require("../services/queryService");

exports.queryDocs = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length < 3) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    const answer = await runQuery(question);

    res.json({
      success: true,
      question,
      answer
    });
  } catch (err) {
    console.error("QUERY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};