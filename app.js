// app.js
const express = require("express");
const cors = require("cors");

const uploadRoutes = require("./routes/uploadRoutes");
const queryRoutes = require("./routes/queryRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const overviewRoutes = require("./routes/overviewRoutes");
const jobRoutes = require("./routes/jobs");

const app = express();

// ============================
// CORS CONFIG
// ============================
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(o => o.trim())
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    // allow server-to-server / curl / healthcheck
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ❗ jangan throw error
    return callback(null, false);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
  credentials: false,
  maxAge: 86400
};

// ⬅️ PASANG PALING ATAS
app.use(cors(corsOptions));

// ⬅️ HANDLE PREFLIGHT MANUAL (AMAN)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// ============================
// BODY PARSER
// ============================
app.use(express.json());

// ============================
// ROUTES
// ============================
app.use("/api", uploadRoutes);
app.use("/api", queryRoutes);
app.use("/api", suggestionRoutes);
app.use("/api", overviewRoutes);
app.use("/api/jobs", jobRoutes);

// ============================
// GLOBAL ERROR HANDLER
// ============================
app.use((err, req, res, next) => {
  console.error("🔥 Global error:", err);

  if (err.message?.includes("Unsupported")) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;