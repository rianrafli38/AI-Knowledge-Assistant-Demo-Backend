const express = require("express");
const cors = require("cors");

const uploadRoutes = require("./routes/uploadRoutes");
const queryRoutes = require("./routes/queryRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const overviewRoutes = require("./routes/overviewRoutes");
const jobRoutes = require("./routes/jobs");

const app = express();

/**
 * ============================
 * CORS — GLOBAL & STABLE
 * ============================
 */
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Authorization, x-admin-key"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );

  // 🔑 PENTING: STOP OPTIONS DI SINI
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// body parser SETELAH CORS
app.use(express.json());

/**
 * ============================
 * ROUTES
 * ============================
 */
app.use("/api", uploadRoutes);
app.use("/api", queryRoutes);
app.use("/api", suggestionRoutes);
app.use("/api", overviewRoutes);
app.use("/api/jobs", jobRoutes);

module.exports = app;