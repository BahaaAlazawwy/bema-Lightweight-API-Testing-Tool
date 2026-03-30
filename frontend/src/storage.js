/**
 * Bema localStorage key registry.
 * Import KEYS and pass them to useLocalStorage to keep all key names in one place.
 */
export const KEYS = {
  HISTORY:        "bema_history",
  COLLECTIONS:    "bema_collections",
  SAVED_REQUESTS: "bema_saved_requests",
  SETTINGS:       "bema_settings",
};

/** Default values for every key. */
export const DEFAULTS = {
  [KEYS.HISTORY]:        [],
  [KEYS.COLLECTIONS]:    [],
  [KEYS.SAVED_REQUESTS]: [],
  [KEYS.SETTINGS]: {
    darkMode: true,
  },
};
