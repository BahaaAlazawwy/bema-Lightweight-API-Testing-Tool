import { useState, useEffect } from "react";

/**
 * Drop-in replacement for useState that persists to localStorage.
 * @param {string} key   - localStorage key
 * @param {*}      init  - default value (used when nothing is stored yet)
 */
export function useLocalStorage(key, init) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable – fail silently
    }
  }, [key, value]);

  return [value, setValue];
}
