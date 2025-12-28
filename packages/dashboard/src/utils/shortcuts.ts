/**
 * Keyboard shortcut definitions
 */
export const SHORTCUTS = {
  SEARCH: {
    key: "/",
    description: "Focus search",
  },
  EXPORT: {
    key: "e",
    ctrl: true,
    description: "Export data",
  },
  REFRESH: {
    key: "r",
    ctrl: true,
    description: "Refresh",
  },
  FILTERS: {
    key: "f",
    description: "Toggle filters",
  },
  ANALYTICS: {
    key: "a",
    ctrl: true,
    description: "Open analytics",
  },
  COMPARE: {
    key: "c",
    ctrl: true,
    description: "Open compare",
  },
} as const;

