import { useState, useCallback } from "react";
import axios from "axios";

const PROXY_URL = "http://localhost:3001/proxy";
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

/**
 * Sends a single method to the proxy and returns a result row.
 * Never throws — errors are captured as { error } rows.
 */
async function probeMethod(url, method) {
  const start = performance.now();
  try {
    const { data } = await axios.post(
      PROXY_URL,
      { url, method, headers: {}, params: {}, body: undefined },
      { timeout: 15000 }
    );
    const duration = Math.round(performance.now() - start);
    return {
      method,
      status:     data.status,
      statusText: data.statusText,
      duration,
      error:      null,
    };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    // Proxy itself returned an error envelope
    const status = err.response?.data?.status ?? null;
    return {
      method,
      status,
      statusText: err.response?.data?.statusText ?? null,
      duration,
      error: err.response?.data?.error || err.message || "Network Error",
    };
  }
}

/**
 * Runs all 5 HTTP methods in parallel against `url`.
 * Results arrive in METHOD order regardless of which settled first.
 */
export function useSmartTest() {
  const [results,  setResults]  = useState(null);   // null = not run yet
  const [running,  setRunning]  = useState(false);
  const [progress, setProgress] = useState(0);       // 0-5 completed

  const run = useCallback(async (url) => {
    if (!url?.trim()) return;

    setRunning(true);
    setResults(null);
    setProgress(0);

    // Kick off all probes at once; update progress as each settles
    const pending = METHODS.map((method) =>
      probeMethod(url, method).then((row) => {
        setProgress((p) => p + 1);
        return row;
      })
    );

    const rows = await Promise.all(pending);

    // Sort back to canonical METHOD order
    const ordered = METHODS.map((m) => rows.find((r) => r.method === m));

    setResults(ordered);
    setRunning(false);
    setProgress(0);
  }, []);

  const clear = useCallback(() => {
    setResults(null);
    setProgress(0);
  }, []);

  return { results, running, progress, run, clear };
}
