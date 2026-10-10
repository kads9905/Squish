import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "squish-theme"; // "light" | "dark" | "system"

const readPreference = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "light";
  } catch {
    return "light";
  }
};

const systemPrefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

const apply = (resolved, animate) => {
  const root = document.documentElement;
  if (animate) {
    // briefly enable colour transitions so the swap fades instead of flashing
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 400);
  }
  root.classList.toggle("dark", resolved === "dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolved === "dark" ? "#0d0d0c" : "#f4f2ec");
};

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readPreference);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  // follow the OS setting while on "system"
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference;

  // skip the fade on first render (the pre-paint script already set the class)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    apply(resolved, mounted);
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved]);

  const setTheme = useCallback((next) => {
    setPreference(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable (private mode) — preference just won't persist */
    }
  }, []);

  const toggle = useCallback(() => setTheme(resolved === "dark" ? "light" : "dark"), [resolved, setTheme]);

  const value = useMemo(() => ({ preference, resolved, setTheme, toggle }), [preference, resolved, setTheme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
