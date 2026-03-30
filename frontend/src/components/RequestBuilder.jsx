import { useState } from "react";
import { motion } from "framer-motion";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const METHOD_STYLES = {
  GET:    "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30",
  POST:   "bg-blue-500/20   text-blue-600   dark:text-blue-400   hover:bg-blue-500/30",
  PUT:    "bg-amber-500/20  text-amber-600  dark:text-amber-400  hover:bg-amber-500/30",
  PATCH:  "bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/30",
  DELETE: "bg-red-500/20    text-red-600    dark:text-red-400    hover:bg-red-500/30",
};

function KeyValueEditor({ rows, onChange, placeholder = "Key" }) {
  const update = (i, field, val) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r));
    const last = next[next.length - 1];
    if (last.key.trim() || last.value.trim()) next.push({ key: "", value: "", enabled: true });
    onChange(next);
  };

  const toggle = (i) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, enabled: !r.enabled } : r)));

  const remove = (i) => {
    const next = rows.filter((_, idx) => idx !== i);
    if (next.length === 0) next.push({ key: "", value: "", enabled: true });
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={() => toggle(i)}
            className="accent-accent w-3 h-3 shrink-0"
          />
          <input
            value={row.key}
            onChange={(e) => update(i, "key", e.target.value)}
            placeholder={placeholder}
            className="flex-1 input-base text-xs px-2 py-1.5"
          />
          <input
            value={row.value}
            onChange={(e) => update(i, "value", e.target.value)}
            placeholder="Value"
            className="flex-1 input-base text-xs px-2 py-1.5"
          />
          {rows.length > 1 && (
            <button
              onClick={() => remove(i)}
              className="t-muted hover:text-red-500 transition-colors p-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M2 2l12 12M14 2L2 14"/>
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function RequestBuilder({ request, onChange, onSend, loading, onSmartTest, smartRunning, onDiscovery, discoveryRunning }) {
  const [tab, setTab] = useState("params");

  const set = (key, val) => onChange({ ...request, [key]: val });

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSend();
  };

  return (
    <div className="bg-panel border-b border-theme shrink-0">
      {/* URL Bar */}
      <div className="flex items-center gap-2 p-3">
        <select
          value={request.method}
          onChange={(e) => set("method", e.target.value)}
          className={`appearance-none text-xs font-bold font-mono px-2.5 py-2 rounded-md border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent/50 ${METHOD_STYLES[request.method]}`}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <input
          type="text"
          value={request.url}
          onChange={(e) => set("url", e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://api.example.com/endpoint"
          className="flex-1 input-base text-sm px-3 py-2"
          spellCheck={false}
        />

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onSend}
          disabled={loading || smartRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {loading ? <><Spinner />Sending</> : <><SendIcon />Send</>}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onSmartTest(request.url)}
          disabled={loading || smartRunning || discoveryRunning || !request.url.trim()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border border-theme hover-item disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          style={{ color: "var(--text-primary)" }}
          title="Auto-test GET, POST, PUT, PATCH, DELETE"
        >
          {smartRunning ? <><Spinner />Testing…</> : <><SmartIcon />Smart Test</>}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onDiscovery(request.url)}
          disabled={loading || smartRunning || discoveryRunning || !request.url.trim()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border border-theme hover-item disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          style={{ color: "var(--text-primary)" }}
          title="Scan common API endpoints on this base URL"
        >
          {discoveryRunning ? <><Spinner />Scanning…</> : <><ScanIcon />Test All Endpoints</>}
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-theme px-3">
        {["params", "headers", "body"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 py-2 text-xs font-medium transition-colors"
            style={{
              color: tab === t ? "var(--text-active)" : "var(--text-muted)",
              borderBottom: tab === t ? "2px solid #6366f1" : "2px solid transparent",
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "params" && request.params.filter((p) => p.key && p.enabled).length > 0 && (
              <span className="ml-1.5 w-4 h-4 inline-flex items-center justify-center rounded-full bg-accent/20 text-accent text-[9px]">
                {request.params.filter((p) => p.key && p.enabled).length}
              </span>
            )}
            {t === "headers" && request.headers.filter((h) => h.key && h.enabled).length > 0 && (
              <span className="ml-1.5 w-4 h-4 inline-flex items-center justify-center rounded-full bg-accent/20 text-accent text-[9px]">
                {request.headers.filter((h) => h.key && h.enabled).length}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-[10px] self-center pr-1" style={{ color: "var(--text-muted)" }}>
          Ctrl+Enter to send
        </span>
      </div>

      {/* Tab panels */}
      <div className="p-3 max-h-40 overflow-y-auto">
        {tab === "params" && (
          <KeyValueEditor rows={request.params} onChange={(v) => set("params", v)} placeholder="Parameter" />
        )}
        {tab === "headers" && (
          <KeyValueEditor rows={request.headers} onChange={(v) => set("headers", v)} placeholder="Header" />
        )}
        {tab === "body" && (
          <textarea
            value={request.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder='{"key": "value"}'
            rows={5}
            className="w-full input-base text-xs px-3 py-2 resize-none"
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}

const SendIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2L2 7l5 3 2 5 5-13z"/>
  </svg>
);

const SmartIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 4h10M3 8h7M3 12h4" strokeLinecap="round"/>
    <circle cx="13" cy="11" r="2.2"/>
    <path d="M13 9V7" strokeLinecap="round"/>
  </svg>
);

const ScanIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 4V2a1 1 0 011-1h2M11 1h2a1 1 0 011 1v2M15 11v2a1 1 0 01-1 1h-2M5 15H3a1 1 0 01-1-1v-2" strokeLinecap="round"/>
    <circle cx="8" cy="8" r="2.5"/>
    <path d="M8 3v1M8 12v1M3 8h1M12 8h1" strokeLinecap="round"/>
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin mr-1" width="12" height="12" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);
