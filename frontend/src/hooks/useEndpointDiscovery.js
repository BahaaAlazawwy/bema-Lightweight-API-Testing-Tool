import { useState, useCallback } from "react";
import axios from "axios";

const PROXY_URL = "http://localhost:3001/proxy";

/** Default endpoint paths to probe. Exported so the UI can show/edit them. */
export const DEFAULT_ENDPOINTS = [
  "/users",
  "/user",
  "/posts",
  "/comments",
  "/login",
  "/logout",
  "/register",
  "/auth",
  "/oauth",
  "/products",
  "/items",
  "/orders",
  "/admin",
  "/profile",
  "/settings",
  "/config",
  "/health",
  "/status",
  "/ping",
  "/api",
  "/v1",
  "/v2",
  "/search",
  "/upload",
];

/** Max concurrent requests fired at the same time */
const CONCURRENCY = 6;

/**
 * Probes a single endpoint path against the proxy.
 * Never throws — network failures become { error } rows.
 */
async function probeEndpoint(baseUrl, path) {
  const url = baseUrl.replace(/\/+$/, "") + path;
  const start = performance.now();
  try {
    const { data } = await axios.post(
      PROXY_URL,
      { url, method: "GET", headers: {}, params: {}, body: undefined },
      { timeout: 12000 }
    );
    return {
      path,
      url,
      status:     data.status,
      statusText: data.statusText,
      duration:   Math.round(performance.now() - start),
      error:      null,
    };
  } catch (err) {
    return {
      path,
      url,
      status:     err.response?.data?.status   ?? null,
      statusText: err.response?.data?.statusText ?? null,
      duration:   Math.round(performance.now() - start),
      error:      err.response?.data?.error || err.message || "Network Error",
    };
  }
}

/**
 * Runs `tasks` with at most `limit` in-flight at once.
 * Calls `onResult` with each row as it completes.
 */
async function pooled(tasks, limit, onResult) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      const row = await tasks[i]();
      onResult(row);
      results[i] = row;
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

export function useEndpointDiscovery() {
  const [results,   setResults]   = useState(null);   // null = not run yet
  const [liveRows,  setLiveRows]  = useState([]);      // rows as they arrive
  const [running,   setRunning]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [total,     setTotal]     = useState(0);

  const run = useCallback(async (baseUrl, endpoints = DEFAULT_ENDPOINTS) => {
    if (!baseUrl?.trim()) return;

    setRunning(true);
    setResults(null);
    setLiveRows([]);
    setProgress(0);
    setTotal(endpoints.length);

    const tasks = endpoints.map((path) => () => probeEndpoint(baseUrl, path));

    await pooled(tasks, CONCURRENCY, (row) => {
      setLiveRows((prev) => [...prev, row]);
      setProgress((p) => p + 1);
    });

    // Final ordered results (match original endpoint order)
    setResults(
      endpoints.map((path) =>
        // liveRows state may lag; reconstruct from task results via closure isn't possible,
        // so we use a ref-free trick: re-query from the settled liveRows via a callback
        path
      )
    );

    // Use functional update to get final liveRows in order
    setLiveRows((final) => {
      const ordered = endpoints.map(
        (path) => final.find((r) => r.path === path) ?? { path, status: null, duration: 0, error: "No response" }
      );
      setResults(ordered);
      return final;
    });

    setRunning(false);
    setProgress(0);
  }, []);

  const clear = useCallback(() => {
    setResults(null);
    setLiveRows([]);
    setProgress(0);
    setTotal(0);
  }, []);

  return { results, liveRows, running, progress, total, run, clear };
}
