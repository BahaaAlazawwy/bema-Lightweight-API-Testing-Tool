import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_ENDPOINTS } from "../hooks/useEndpointDiscovery";

// ─── shared helpers (same palette as SmartTestResults) ───────────────────────

function statusMeta(status) {
  if (!status) return { bg: "rgba(107,114,128,0.15)", text: "#6b7280",  label: "—"    };
  if (status < 300) return { bg: "rgba(16,185,129,0.15)",  text: "#10b981", label: String(status) };
  if (status < 400) return { bg: "rgba(59,130,246,0.15)",  text: "#3b82f6", label: String(status) };
  if (status < 500) return { bg: "rgba(245,158,11,0.15)",  text: "#f59e0b", label: String(status) };
  return               { bg: "rgba(239,68,68,0.15)",   text: "#ef4444", label: String(status) };
}

function timeMeta(ms) {
  if (ms < 200) return "#10b981";
  if (ms < 600) return "#f59e0b";
  return "#ef4444";
}

// ─── sub-components ──────────────────────────────────────────────────────────

function SkeletonRow({ delay }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.25, 0.6, 0.25] }}
      transition={{ duration: 1.4, repeat: Infinity, delay }}
    >
      {[35, 30, 25, 20].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded" style={{ width: `${w}%`, backgroundColor: "var(--bg-hover)" }} />
        </td>
      ))}
    </motion.tr>
  );
}

function ScanProgressBar({ progress, total }) {
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-theme">
      <span className="text-xs font-mono w-20 shrink-0" style={{ color: "var(--text-muted)" }}>
        {progress}/{total} scanned
      </span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-hover)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ ease: "easeOut", duration: 0.25 }}
        />
      </div>
      <span className="text-xs font-mono w-8 shrink-0 text-right" style={{ color: "var(--text-muted)" }}>
        {pct}%
      </span>
    </div>
  );
}

function ResultRow({ row, index }) {
  const s  = statusMeta(row.status);
  const tc = timeMeta(row.duration);
  const isAlive = row.status && row.status < 500 && !row.error;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.4) }}
      className="border-b border-theme last:border-0 group"
    >
      {/* Endpoint path */}
      <td className="px-4 py-2.5 w-40">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: isAlive ? "#10b981" : row.error ? "#6b7280" : s.text }}
          />
          <span className="text-xs font-mono font-medium" style={{ color: "var(--text-primary)" }}>
            {row.path}
          </span>
        </div>
      </td>

      {/* Full URL (truncated) */}
      <td className="px-4 py-2.5 hidden md:table-cell">
        <span
          className="text-[11px] font-mono truncate block max-w-xs"
          style={{ color: "var(--text-muted)" }}
          title={row.url}
        >
          {row.url}
        </span>
      </td>

      {/* Status badge */}
      <td className="px-4 py-2.5 w-32">
        {row.error && !row.status ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 2v6M8 12v.5" strokeLinecap="round"/>
              <circle cx="8" cy="8" r="6.5"/>
            </svg>
            Network Error
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold font-mono"
            style={{ backgroundColor: s.bg, color: s.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.text }} />
            {s.label}
            {row.statusText && (
              <span className="font-normal opacity-60">{row.statusText}</span>
            )}
          </span>
        )}
      </td>

      {/* Response time */}
      <td className="px-4 py-2.5 w-28">
        <span className="text-xs font-mono font-semibold" style={{ color: tc }}>
          {row.duration}ms
        </span>
        <div
          className="mt-1 h-0.5 rounded-full opacity-40"
          style={{
            backgroundColor: tc,
            width: `${Math.min((row.duration / 800) * 100, 100)}%`,
            minWidth: "3px",
          }}
        />
      </td>
    </motion.tr>
  );
}

function DiscoverySummary({ results }) {
  const alive  = results.filter((r) => r.status && r.status < 400).length;
  const client = results.filter((r) => r.status >= 400 && r.status < 500).length;
  const server = results.filter((r) => r.status >= 500).length;
  const failed = results.filter((r) => !r.status).length;
  const avgMs  = results.length
    ? Math.round(results.reduce((a, r) => a + (r.duration || 0), 0) / results.length)
    : 0;

  const pills = [
    { label: `${alive} Alive`,   color: "#10b981", show: alive  > 0 },
    { label: `${client} Client`, color: "#f59e0b", show: client > 0 },
    { label: `${server} Server`, color: "#ef4444", show: server > 0 },
    { label: `${failed} Failed`, color: "#6b7280", show: failed > 0 },
  ];

  return (
    <div
      className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-t border-theme text-xs"
      style={{ backgroundColor: "var(--bg-input)" }}
    >
      {pills.filter((p) => p.show).map((p) => (
        <span key={p.label} className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span style={{ color: "var(--text-secondary)" }}>{p.label}</span>
        </span>
      ))}
      <span className="ml-auto font-mono" style={{ color: "var(--text-muted)" }}>
        {results.length} endpoints · avg {avgMs}ms
      </span>
    </div>
  );
}

// ─── Endpoint configurator panel ─────────────────────────────────────────────

function EndpointConfig({ endpoints, onChange }) {
  const [newPath, setNewPath] = useState("");

  const add = () => {
    const p = newPath.trim().startsWith("/") ? newPath.trim() : `/${newPath.trim()}`;
    if (!p || p === "/" || endpoints.includes(p)) return;
    onChange([...endpoints, p]);
    setNewPath("");
  };

  const remove = (path) => onChange(endpoints.filter((e) => e !== path));

  const reset = () => onChange([...DEFAULT_ENDPOINTS]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-b border-theme overflow-hidden"
      style={{ backgroundColor: "var(--bg-input)" }}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Endpoints to scan ({endpoints.length})
          </span>
          <button
            onClick={reset}
            className="text-[11px] hover:text-accent transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            Reset to defaults
          </button>
        </div>

        {/* Tag-style endpoint list */}
        <div className="flex flex-wrap gap-1.5 mb-2.5 max-h-24 overflow-y-auto">
          {endpoints.map((path) => (
            <span
              key={path}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono group"
              style={{ backgroundColor: "var(--bg-panel)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              {path}
              <button
                onClick={() => remove(path)}
                className="opacity-40 group-hover:opacity-100 hover:text-red-500 transition-all leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Add new endpoint */}
        <div className="flex gap-2">
          <input
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="/custom-endpoint"
            className="flex-1 input-base text-xs px-2.5 py-1.5"
          />
          <button
            onClick={add}
            className="px-3 py-1.5 text-xs rounded-md bg-accent hover:bg-accent-hover text-white font-semibold transition-colors shrink-0"
          >
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EndpointDiscovery({
  results,
  liveRows,
  running,
  progress,
  total,
  baseUrl,
  endpoints,
  onEndpointsChange,
  onClear,
}) {
  const [configOpen, setConfigOpen] = useState(false);

  if (!running && !results && liveRows.length === 0) return null;

  // While running, show liveRows (in arrival order); when done, show ordered results
  const displayRows = running ? liveRows : (results ?? liveRows);

  return (
    <AnimatePresence>
      <motion.div
        key="discovery-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="border-t border-theme flex flex-col"
        style={{ backgroundColor: "var(--bg-app)" }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b border-theme shrink-0"
          style={{ backgroundColor: "var(--bg-panel)" }}
        >
          <div className="flex items-center gap-2.5">
            {/* Live pulse / done indicator */}
            <span className="relative flex h-2 w-2 shrink-0">
              {running ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                    style={{ backgroundColor: "#8b5cf6" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#8b5cf6" }} />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              )}
            </span>

            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              Endpoint Discovery
            </span>

            {baseUrl && (
              <span className="text-[11px] font-mono truncate max-w-xs" style={{ color: "var(--text-muted)" }}>
                {baseUrl.replace(/^https?:\/\//, "")}
              </span>
            )}

            {running && (
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                scanning…
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Config toggle */}
            {!running && (
              <button
                onClick={() => setConfigOpen((v) => !v)}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: configOpen ? "#6366f1" : "var(--text-muted)" }}
              >
                <ConfigIcon />
                Configure
              </button>
            )}

            {!running && (
              <button
                onClick={onClear}
                className="text-xs hover:text-red-500 transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Config panel (collapsible) ── */}
        <AnimatePresence>
          {configOpen && !running && (
            <EndpointConfig endpoints={endpoints} onChange={onEndpointsChange} />
          )}
        </AnimatePresence>

        {/* ── Progress bar ── */}
        {running && <ScanProgressBar progress={progress} total={total} />}

        {/* ── Table ── */}
        <div className="overflow-auto flex-1" style={{ maxHeight: "320px" }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-theme" style={{ backgroundColor: "var(--bg-panel)" }}>
                {[
                  { label: "Endpoint", cls: "" },
                  { label: "URL",      cls: "hidden md:table-cell" },
                  { label: "Status",   cls: "" },
                  { label: "Time",     cls: "" },
                ].map(({ label, cls }) => (
                  <th
                    key={label}
                    className={`px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider ${cls}`}
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {displayRows.length === 0 && running
                ? Array.from({ length: Math.min(total, 8) }).map((_, i) => (
                    <SkeletonRow key={i} delay={i * 0.07} />
                  ))
                : displayRows.map((row, i) => (
                    <ResultRow key={row.path + i} row={row} index={i} />
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* ── Summary footer ── */}
        {!running && results && results.length > 0 && (
          <DiscoverySummary results={results} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

const ConfigIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="8" cy="8" r="2"/>
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/>
  </svg>
);
