// app.js
const express = require("express");
const app = express();

/**
 * ============================
 * 🔥 GLOBAL CORS — ABSOLUT
 * ============================
 */
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(o => o.trim());

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Authorization, x-admin-key"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );

  // 🔑 INI PENTING
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// ⛔ body parser SETELAH CORS
app.use(express.json());

// ROUTES
app.use("/api", require("./routes/uploadRoutes"));
app.use("/api", require("./routes/queryRoutes"));
app.use("/api", require("./routes/suggestionRoutes"));
app.use("/api", require("./routes/overviewRoutes"));
app.use("/api/jobs", require("./routes/jobs"));

module.exports = app;