import { useState, useCallback, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import RequestBuilder from "./components/RequestBuilder";
import ResponseViewer from "./components/ResponseViewer";
import SmartTestResults from "./components/SmartTestResults";
import EndpointDiscovery from "./components/EndpointDiscovery";
import axios from "axios";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useSmartTest } from "./hooks/useSmartTest";
import { useEndpointDiscovery, DEFAULT_ENDPOINTS } from "./hooks/useEndpointDiscovery";
import { KEYS, DEFAULTS } from "./storage";

const PROXY_URL = "http://localhost:3001/proxy";

const defaultRequest = {
  method: "GET",
  url: "",
  headers: [{ key: "", value: "", enabled: true }],
  body: "",
  params: [{ key: "", value: "", enabled: true }],
};

export default function App() {
  // ── Persisted state ──────────────────────────────────────────────────────
  const [history,       setHistory]       = useLocalStorage(KEYS.HISTORY,        DEFAULTS[KEYS.HISTORY]);
  const [collections,   setCollections]   = useLocalStorage(KEYS.COLLECTIONS,    DEFAULTS[KEYS.COLLECTIONS]);
  const [savedRequests, setSavedRequests] = useLocalStorage(KEYS.SAVED_REQUESTS, DEFAULTS[KEYS.SAVED_REQUESTS]);
  const [settings,      setSettings]      = useLocalStorage(KEYS.SETTINGS,       DEFAULTS[KEYS.SETTINGS]);

  // ── Smart Test ──────────────────────────────────────────────────────────
  const { results: smartResults, running: smartRunning, progress: smartProgress, run: runSmartTest, clear: clearSmartTest } = useSmartTest();

  // ── Endpoint Discovery ───────────────────────────────────────────────────
  const { results: discoveryResults, liveRows, running: discoveryRunning, progress: discoveryProgress, total: discoveryTotal, run: runDiscovery, clear: clearDiscovery } = useEndpointDiscovery();
  const [discoveryEndpoints, setDiscoveryEndpoints] = useState([...DEFAULT_ENDPOINTS]);

  const handleDiscovery = useCallback((url) => {
    // Strip path — use only origin + pathname root as base URL
    try {
      const parsed = new URL(url);
      const base = parsed.origin;
      runDiscovery(base, discoveryEndpoints);
    } catch {
      runDiscovery(url, discoveryEndpoints);
    }
  }, [runDiscovery, discoveryEndpoints]);

  // ── Session-only state ───────────────────────────────────────────────────
  const [request,   setRequest]   = useState(defaultRequest);
  const [response,  setResponse]  = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [saveModal, setSaveModal] = useState(false);
  const [saveName,  setSaveName]  = useState("");

  // ── Apply dark mode on mount and on change ───────────────────────────────
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  const toggleDark = () =>
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));

  // ── Send request ─────────────────────────────────────────────────────────
  const sendRequest = useCallback(async () => {
    if (!request.url.trim()) {
      setError("Please enter a URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const headersObj = {};
    request.headers.forEach(({ key, value, enabled }) => {
      if (enabled && key.trim()) headersObj[key.trim()] = value;
    });

    const paramsObj = {};
    request.params.forEach(({ key, value, enabled }) => {
      if (enabled && key.trim()) paramsObj[key.trim()] = value;
    });

    let parsedBody = request.body;
    if (request.body && typeof request.body === "string") {
      try { parsedBody = JSON.parse(request.body); } catch { /* send as string */ }
    }

    try {
      const { data } = await axios.post(PROXY_URL, {
        url: request.url,
        method: request.method,
        headers: headersObj,
        params: paramsObj,
        body: parsedBody || undefined,
      });

      setResponse(data);

      // Persist to bema_history (max 50 entries)
      setHistory((prev) => [
        { ...request, timestamp: Date.now(), status: data.status },
        ...prev.filter((h) => h.url !== request.url || h.method !== request.method).slice(0, 48),
      ]);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  }, [request, setHistory]);

  // ── Save to collection ────────────────────────────────────────────────────
  const openSaveModal = () => {
    setSaveName(request.url || "Untitled request");
    setSaveModal(true);
  };

  const confirmSave = () => {
    if (!saveName.trim()) return;
    const entry = { ...request, name: saveName.trim(), id: Date.now() };

    // Save to both bema_collections and bema_saved_requests
    setCollections((prev) => [...prev, entry]);
    setSavedRequests((prev) => [...prev, entry]);

    setSaveModal(false);
    setSaveName("");
  };

  // ── Load from history / collection ───────────────────────────────────────
  const loadRequest = (item) => {
    setRequest({
      method:  item.method  || "GET",
      url:     item.url     || "",
      headers: item.headers?.length ? item.headers : [{ key: "", value: "", enabled: true }],
      body:    item.body    || "",
      params:  item.params?.length  ? item.params  : [{ key: "", value: "", enabled: true }],
    });
    setResponse(null);
    setError(null);
  };

  const deleteCollection = (id) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setSavedRequests((prev) => prev.filter((c) => c.id !== id));
  };

  const clearHistory = () => setHistory([]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-app)" }}>
      <div className="flex flex-col h-full bg-app" id="app-root">
        <TopBar
          darkMode={settings.darkMode}
          onToggleDark={toggleDark}
          onSave={openSaveModal}
        />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            history={history}
            collections={collections}
            onLoadHistory={loadRequest}
            onLoadCollection={loadRequest}
            onDeleteCollection={deleteCollection}
            onClearHistory={clearHistory}
          />

          <main className="flex flex-col flex-1 overflow-hidden">
            <RequestBuilder
              request={request}
              onChange={setRequest}
              onSend={sendRequest}
              loading={loading}
              onSmartTest={runSmartTest}
              smartRunning={smartRunning}
              onDiscovery={handleDiscovery}
              discoveryRunning={discoveryRunning}
            />

            <ResponseViewer
              response={response}
              error={error}
              loading={loading}
              isDark={settings.darkMode}
            />

            <SmartTestResults
              results={smartResults}
              running={smartRunning}
              progress={smartProgress}
              url={request.url}
              onClear={clearSmartTest}
            />

            <EndpointDiscovery
              results={discoveryResults}
              liveRows={liveRows}
              running={discoveryRunning}
              progress={discoveryProgress}
              total={discoveryTotal}
              baseUrl={request.url}
              endpoints={discoveryEndpoints}
              onEndpointsChange={setDiscoveryEndpoints}
              onClear={clearDiscovery}
            />
          </main>
        </div>

        {/* Save modal */}
        {saveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
              className="border border-theme rounded-xl shadow-2xl p-5 w-80"
              style={{ backgroundColor: "var(--bg-panel)" }}
            >
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                Save Request
              </h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                Saved to Collections &amp; Saved Requests
              </p>
              <input
                autoFocus
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmSave();
                  if (e.key === "Escape") setSaveModal(false);
                }}
                placeholder="Request name"
                className="w-full input-base text-sm px-3 py-2 mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setSaveModal(false)}
                  className="px-3 py-1.5 text-xs rounded-md hover-item transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSave}
                  className="px-3 py-1.5 text-xs rounded-md bg-accent hover:bg-accent-hover text-white font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
