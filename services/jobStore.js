// services/jobStore.js
const jobs = new Map();

function createJob(initial = {}) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);

  jobs.set(id, {
    status: "pending",
    step: "created",
    progress: 0,
    logs: [],
    error: null,
    ...initial  // ⬅️ APPLY INITIAL VALUES
  });

  return id;
}

function updateJob(id, patch) {
  const job = jobs.get(id);
  if (!job) return;

  Object.assign(job, patch);
}

function logJob(id, message) {
  const job = jobs.get(id);
  if (!job) return;

  job.logs.push(`[${new Date().toISOString()}] ${message}`);
}

function getJob(id) {
  return jobs.get(id);
}

module.exports = {
  createJob,
  updateJob,
  logJob,
  getJob
};