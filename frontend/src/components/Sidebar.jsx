import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const METHOD_COLORS = {
  GET:    "text-emerald-500",
  POST:   "text-blue-500",
  PUT:    "text-amber-500",
  PATCH:  "text-orange-500",
  DELETE: "text-red-500",
};

function StatusDot({ status }) {
  const color =
    status >= 500 ? "bg-red-400" :
    status >= 400 ? "bg-amber-400" :
    status >= 300 ? "bg-blue-400" :
    status >= 200 ? "bg-emerald-400" : "bg-gray-400";
  return <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color}`} />;
}

function HistoryItem({ item, onClick }) {
  const color = METHOD_COLORS[item.method] || "t-secondary";
  const short = item.url.replace(/^https?:\/\//, "").slice(0, 38);
  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover-item text-left group transition-colors"
    >
      <span className={`text-[10px] font-bold font-mono w-10 shrink-0 ${color}`}>
        {item.method}
      </span>
      <span className="text-xs t-secondary group-hover:t-primary truncate flex-1 transition-colors">
        {short}
      </span>
      {item.status && <StatusDot status={item.status} />}
    </motion.button>
  );
}

function CollectionItem({ item, onLoad, onDelete }) {
  const color = METHOD_COLORS[item.method] || "t-secondary";
  const short = item.name.slice(0, 28);
  return (
    <div className="flex items-center gap-1 px-3 py-1.5 rounded-md hover-item group transition-colors">
      <button onClick={onLoad} className="flex items-center gap-2 flex-1 text-left">
        <span className={`text-[10px] font-bold font-mono w-10 shrink-0 ${color}`}>
          {item.method}
        </span>
        <span className="text-xs t-secondary truncate transition-colors">
          {short}
        </span>
      </button>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 t-muted transition-all"
        title="Delete"
      >
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 4h12M6 4V2h4v2M5 4l1 10h4l1-10"/>
        </svg>
      </button>
    </div>
  );
}

export default function Sidebar({ history, collections, onLoadHistory, onLoadCollection, onDeleteCollection, onClearHistory }) {
  const [tab, setTab] = useState("history");

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-panel border-r border-theme overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-theme">
        {["history", "collections"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              tab === t
                ? "t-active border-b-2 border-accent"
                : "t-muted hover:t-secondary"
            }`}
            style={tab === t ? { color: "var(--text-active)" } : { color: "var(--text-muted)" }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2">
        <AnimatePresence mode="wait">
          {tab === "history" && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {history.length === 0 ? (
                <p className="text-xs text-center mt-8 px-4" style={{ color: "var(--text-muted)" }}>
                  No requests yet.<br />Send one to see history.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between px-3 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      {history.length} request{history.length !== 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={onClearHistory}
                      className="text-[10px] hover:text-red-500 transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      title="Clear history"
                    >
                      Clear
                    </button>
                  </div>
                  {history.map((item, i) => (
                    <HistoryItem key={i} item={item} onClick={() => onLoadHistory(item)} />
                  ))}
                </>
              )}
            </motion.div>
          )}

          {tab === "collections" && (
            <motion.div key="collections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {collections.length === 0 ? (
                <p className="text-xs text-center mt-8 px-4" style={{ color: "var(--text-muted)" }}>
                  No saved requests.<br />Click Save to add one.
                </p>
              ) : (
                collections.map((item) => (
                  <CollectionItem
                    key={item.id}
                    item={item}
                    onLoad={() => onLoadCollection(item)}
                    onDelete={() => onDeleteCollection(item.id)}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
