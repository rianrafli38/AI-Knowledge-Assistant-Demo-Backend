// app.js
const express = require("express");
const app = express();

const uploadRoutes = require("./routes/uploadRoutes");
const queryRoutes = require("./routes/queryRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const overviewRoutes = require("./routes/overviewRoutes");
const jobRoutes = require("./routes/jobs");

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Authorization, x-admin-key"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );

  // 🔑 PRE-FLIGHT STOP HERE
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

// ROUTES
app.use("/api", uploadRoutes);
app.use("/api", queryRoutes);
app.use("/api", suggestionRoutes);
app.use("/api", overviewRoutes);
app.use("/api/jobs", jobRoutes);

module.exports = app;