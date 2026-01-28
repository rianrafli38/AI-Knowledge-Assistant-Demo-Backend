async function retryAsync(fn, retries = 3, delay = 1500) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;

    console.warn("⚠️ Retry after error:", err.message || err);

    await new Promise(resolve => setTimeout(resolve, delay));

    return retryAsync(fn, retries - 1, delay * 1.5);
  }
}

module.exports = retryAsync;