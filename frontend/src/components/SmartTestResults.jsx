import { motion, AnimatePresence } from "framer-motion";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const METHOD_COLOR = {
  GET:    { bg: "rgba(16,185,129,0.12)", text: "#10b981" },
  POST:   { bg: "rgba(59,130,246,0.12)", text: "#3b82f6" },
  PUT:    { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
  PATCH:  { bg: "rgba(249,115,22,0.12)", text: "#f97316" },
  DELETE: { bg: "rgba(239,68,68,0.12)",  text: "#ef4444" },
};

function statusMeta(status) {
  if (!status) return { bg: "rgba(107,114,128,0.15)", text: "#6b7280",  label: "—"  };
  if (status < 300) return { bg: "rgba(16,185,129,0.15)",  text: "#10b981", label: String(status) };
  if (status < 400) return { bg: "rgba(59,130,246,0.15)",  text: "#3b82f6", label: String(status) };
  if (status < 500) return { bg: "rgba(245,158,11,0.15)",  text: "#f59e0b", label: String(status) };
  return               { bg: "rgba(239,68,68,0.15)",   text: "#ef4444", label: String(status) };
}

function timeMeta(ms) {
  if (ms < 200)  return "#10b981";
  if (ms < 600)  return "#f59e0b";
  return "#ef4444";
}

/** Single skeleton row while loading */
function SkeletonRow({ delay }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 1.2, repeat: Infinity, delay }}
    >
      {[40, 60, 50].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-5 rounded-md"
            style={{ width: `${w}%`, backgroundColor: "var(--bg-hover)" }}
          />
        </td>
      ))}
    </motion.tr>
  );
}

/** Progress bar across all 5 methods */
function ProgressBar({ progress }) {
  const pct = Math.round((progress / 5) * 100);
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-theme">
      <span className="text-xs font-mono shrink-0" style={{ color: "var(--text-muted)" }}>
        {progress}/5 tested
      </span>
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-hover)" }}>
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ ease: "easeOut", duration: 0.3 }}
        />
      </div>
      <span className="text-xs font-mono shrink-0" style={{ color: "var(--text-muted)" }}>{pct}%</span>
    </div>
  );
}

/** A completed result row */
function ResultRow({ row, index }) {
  const m  = METHOD_COLOR[row.method] || METHOD_COLOR.GET;
  const s  = statusMeta(row.status);
  const tc = timeMeta(row.duration);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border-b border-theme last:border-0 group"
    >
      {/* Method */}
      <td className="px-4 py-3 w-28">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-wide"
          style={{ backgroundColor: m.bg, color: m.text }}
        >
          {row.method}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3 w-36">
        {row.error && !row.status ? (
          <span className="text-xs font-medium text-red-500">Network Error</span>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono"
            style={{ backgroundColor: s.bg, color: s.text }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: s.text }}
            />
            {s.label}
            {row.statusText && (
              <span className="font-normal opacity-70 ml-0.5">{row.statusText}</span>
            )}
          </span>
        )}
      </td>

      {/* Response time */}
      <td className="px-4 py-3">
        <span className="text-xs font-mono font-semibold" style={{ color: tc }}>
          {row.duration}ms
        </span>
        <div
          className="mt-1 h-0.5 rounded-full"
          style={{
            width: `${Math.min((row.duration / 1000) * 100, 100)}%`,
            minWidth: "4px",
            backgroundColor: tc,
            opacity: 0.4,
          }}
        />
      </td>

      {/* Error note */}
      <td className="px-4 py-3 hidden sm:table-cell">
        {row.error && (
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {row.error.length > 60 ? row.error.slice(0, 60) + "…" : row.error}
          </span>
        )}
      </td>
    </motion.tr>
  );
}

/** Summary bar shown below the table */
function Summary({ results }) {
  const ok    = results.filter((r) => r.status && r.status < 400).length;
  const warn  = results.filter((r) => r.status && r.status >= 400 && r.status < 500).length;
  const err   = results.filter((r) => r.status && r.status >= 500).length;
  const fails = results.filter((r) => !r.status).length;
  const avgMs = Math.round(results.reduce((a, r) => a + r.duration, 0) / results.length);

  const pills = [
    { label: `${ok} Success`,  color: "#10b981", show: ok    > 0 },
    { label: `${warn} Client`, color: "#f59e0b", show: warn  > 0 },
    { label: `${err} Server`,  color: "#ef4444", show: err   > 0 },
    { label: `${fails} Failed`,color: "#6b7280", show: fails > 0 },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-t border-theme" style={{ backgroundColor: "var(--bg-input)" }}>
      {pills.filter((p) => p.show).map((p) => (
        <span key={p.label} className="flex items-center gap-1.5 text-xs font-medium">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span style={{ color: "var(--text-secondary)" }}>{p.label}</span>
        </span>
      ))}
      <span className="ml-auto text-xs font-mono" style={{ color: "var(--text-muted)" }}>
        avg {avgMs}ms
      </span>
    </div>
  );
}

export default function SmartTestResults({ results, running, progress, url, onClear }) {
  if (!running && !results) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="smart-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="border-t border-theme"
        style={{ backgroundColor: "var(--bg-app)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-theme" style={{ backgroundColor: "var(--bg-panel)" }}>
          <div className="flex items-center gap-2.5">
            {/* Pulse icon while running */}
            <span className="relative flex h-2 w-2">
              {running ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              )}
            </span>
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              Smart API Test Results
            </span>
            {url && (
              <span
                className="text-[11px] font-mono truncate max-w-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {url.replace(/^https?:\/\//, "")}
              </span>
            )}
          </div>

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

        {/* Progress bar (only while running) */}
        {running && <ProgressBar progress={progress} />}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme" style={{ backgroundColor: "var(--bg-panel)" }}>
                {["Method", "Status", "Response Time", "Note"].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider ${h === "Note" ? "hidden sm:table-cell" : ""}`}
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {running && !results
                ? METHODS.map((_, i) => <SkeletonRow key={i} delay={i * 0.1} />)
                : results?.map((row, i) => <ResultRow key={row.method} row={row} index={i} />)
              }
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        {results && !running && <Summary results={results} />}
      </motion.div>
    </AnimatePresence>
  );
}
