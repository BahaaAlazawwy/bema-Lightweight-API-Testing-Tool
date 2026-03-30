import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function statusColor(code) {
  if (code >= 500) return "#ef4444";
  if (code >= 400) return "#f59e0b";
  if (code >= 300) return "#3b82f6";
  if (code >= 200) return "#10b981";
  return "var(--text-secondary)";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function prettyJson(data) {
  try {
    return JSON.stringify(typeof data === "string" ? JSON.parse(data) : data, null, 2);
  } catch {
    return typeof data === "string" ? data : JSON.stringify(data);
  }
}

// Light-mode-aware JSON token colors
const TOKEN = {
  key:     { dark: "#93c5fd", light: "#2563eb" },
  string:  { dark: "#6ee7b7", light: "#059669" },
  number:  { dark: "#c4b5fd", light: "#7c3aed" },
  bool:    { dark: "#fcd34d", light: "#b45309" },
  null:    { dark: "#6b7280", light: "#9ca3af" },
  bracket: { dark: "#9ca3af", light: "#6b7280" },
};

function JsonLine({ line, isDark }) {
  const mode = isDark ? "dark" : "light";
  const parts = line.split(/("(?:[^"\\]|\\.)*"(?:\s*:)?|true|false|null|\b-?\d+(?:\.\d+)?\b)/g);
  return (
    <span>
      {parts.map((part, i) => {
        const t = part.trim();
        if (/^".*":$/.test(t))  return <span key={i} style={{ color: TOKEN.key[mode] }}>{part}</span>;
        if (/^".*"$/.test(t))   return <span key={i} style={{ color: TOKEN.string[mode] }}>{part}</span>;
        if (t === "true" || t === "false") return <span key={i} style={{ color: TOKEN.bool[mode] }}>{part}</span>;
        if (t === "null")        return <span key={i} style={{ color: TOKEN.null[mode] }}>{part}</span>;
        if (/^-?\d/.test(t))    return <span key={i} style={{ color: TOKEN.number[mode] }}>{part}</span>;
        return <span key={i} style={{ color: TOKEN.bracket[mode] }}>{part}</span>;
      })}
    </span>
  );
}

function CodeBlock({ content, isDark }) {
  const lines = content.split("\n");
  return (
    <div className="font-mono text-xs leading-5">
      {lines.map((line, i) => (
        <div key={i} className="flex">
          <span className="select-none w-10 shrink-0 text-right pr-3 text-[10px] leading-5"
            style={{ color: "var(--text-muted)" }}>
            {i + 1}
          </span>
          <JsonLine line={line} isDark={isDark} />
        </div>
      ))}
    </div>
  );
}

export default function ResponseViewer({ response, error, loading, isDark }) {
  const [tab, setTab] = useState("body");
  const [copied, setCopied] = useState(false);

  const bodyText = response ? prettyJson(response.data) : "";
  const size = bodyText ? formatBytes(new TextEncoder().encode(bodyText).length) : null;

  const copy = async () => {
    await navigator.clipboard.writeText(bodyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-app">
      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-2 bg-panel border-b border-theme shrink-0">
        {response && (
          <>
            <span className="text-sm font-bold" style={{ color: statusColor(response.status) }}>
              {response.status} {response.statusText}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{response.duration}ms</span>
            {size && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{size}</span>}
          </>
        )}
        {!response && !loading && !error && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Send a request to see the response
          </span>
        )}
        {error && <span className="text-xs text-red-500">{error}</span>}

        {response && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={copy}
            className="ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded hover-item transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied!" : "Copy"}
          </motion.button>
        )}
      </div>

      {/* Tabs */}
      {response && (
        <div className="flex border-b border-theme px-4 bg-panel">
          {["body", "headers"].map((t) => (
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
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2"/>
                  <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Sending request…</span>
              </div>
            </motion.div>
          )}

          {!loading && response && tab === "body" && (
            <motion.div key="body" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
              <CodeBlock content={bodyText} isDark={isDark} />
            </motion.div>
          )}

          {!loading && response && tab === "headers" && (
            <motion.div key="headers" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b border-theme">
                    <th className="pb-2 font-semibold w-1/3" style={{ color: "var(--text-secondary)" }}>Header</th>
                    <th className="pb-2 font-semibold" style={{ color: "var(--text-secondary)" }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(response.headers).map(([k, v]) => (
                    <tr key={k} className="border-b border-theme">
                      <td className="py-1.5 pr-4 font-mono" style={{ color: TOKEN.key[isDark ? "dark" : "light"] }}>{k}</td>
                      <td className="py-1.5 font-mono break-all" style={{ color: "var(--text-primary)" }}>{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const CopyIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="5" y="5" width="9" height="9" rx="1"/>
    <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
