const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/", async (req, res) => {
  const { url, method, headers, body, params } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required." });
  }

  const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];
  const httpMethod = (method || "GET").toUpperCase();

  if (!allowedMethods.includes(httpMethod)) {
    return res.status(400).json({ error: `Method "${httpMethod}" is not allowed.` });
  }

  try {
    const startTime = Date.now();

    const response = await axios({
      url,
      method: httpMethod,
      headers: headers || {},
      params: params || {},
      data: body || undefined,
      validateStatus: () => true, // forward all status codes
      timeout: 30000,
    });

    const duration = Date.now() - startTime;

    return res.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      duration,
    });
  } catch (err) {
    if (err.code === "ECONNABORTED") {
      return res.status(504).json({ error: "Request timed out." });
    }
    if (err.code === "ERR_INVALID_URL" || err.code === "ENOTFOUND") {
      return res.status(400).json({ error: `Invalid or unreachable URL: ${url}` });
    }
    return res.status(500).json({ error: err.message || "Proxy error." });
  }
});

module.exports = router;
