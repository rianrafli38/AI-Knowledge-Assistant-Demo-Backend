// summaryCache.js
let cachedSummary = null;
let lastUpdated = 0;

// default TTL: 10 menit
const TTL = 10 * 60 * 1000;

function setSummary(summary) {
  cachedSummary = summary;
  lastUpdated = Date.now();
}

function getSummary() {
  if (!cachedSummary) return null;
  if (Date.now() - lastUpdated > TTL) return null; // expired
  return cachedSummary;
}

module.exports = { setSummary, getSummary };