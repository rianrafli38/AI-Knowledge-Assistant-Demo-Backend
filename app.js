// app.js
const express = require("express");
const cors = require("cors");

const uploadRoutes = require("./routes/uploadRoutes");
const queryRoutes = require("./routes/queryRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const overviewRoutes = require("./routes/overviewRoutes");
const jobRoutes = require("./routes/jobs");

const app = express();
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server or curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"]
  })
);

app.use(express.json());

app.use("/api", uploadRoutes);
app.use("/api", queryRoutes);
app.use("/api", suggestionRoutes);
app.use("/api", overviewRoutes);
app.use("/api/jobs", jobRoutes);

module.exports = app;