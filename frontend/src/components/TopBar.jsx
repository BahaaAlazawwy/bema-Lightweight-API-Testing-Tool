import { motion } from "framer-motion";

export default function TopBar({ darkMode, onToggleDark, onSave }) {
  return (
    <header
      className="flex items-center justify-between px-4 h-12 bg-panel border-b border-theme shrink-0"
      style={{ boxShadow: "var(--shadow)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-accent flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M7 2l5 5-5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-semibold text-sm tracking-tight t-primary">Bema</span>
        <span className="text-xs t-muted ml-1">API Testing Tool</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md hover-item t-secondary"
        >
          <SaveIcon />
          Save
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleDark}
          className="w-8 h-8 flex items-center justify-center rounded-md hover-item t-secondary"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </motion.button>
      </div>
    </header>
  );
}

const SaveIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M13 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5l-3-3z"/>
    <path d="M10 2v3H5V2M5 9h6v5H5V9z"/>
  </svg>
);

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);
