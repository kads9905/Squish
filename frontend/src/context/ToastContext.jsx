import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Check, AlertTriangle, Hand, Info, X } from "lucide-react";
import { cn } from "../lib/cn";

const ToastContext = createContext(null);

const LIFETIME = 4500; // ms on screen (paused while hovered)
const EXIT_MS = 320; // must match the toast-out animation

// every type shares the same pill motion; only the icon gets its own little gesture
const ICONS = {
  success: { icon: Check, cls: "bg-accent text-[#151413]", gesture: "animate-[icon-pop_0.5s_var(--ease-squish)_0.12s_backwards]" },
  error: { icon: AlertTriangle, cls: "bg-danger text-on-ink", gesture: "animate-[icon-shake_0.5s_ease-in-out_0.15s_backwards]" },
  info: { icon: Info, cls: "bg-on-ink/15 text-on-ink", gesture: "animate-[icon-pop_0.5s_var(--ease-squish)_0.12s_backwards]" },
  // goodbyes (log out, account deleted): the hand waves twice
  bye: { icon: Hand, cls: "bg-accent text-[#151413]", gesture: "origin-[70%_90%] animate-[wave_1.1s_ease-in-out_0.15s_2_backwards]" },
};

let nextId = 0;

function Toast({ toast, onDone }) {
  const { icon: Icon, cls, gesture } = ICONS[toast.type];
  const [leaving, setLeaving] = useState(false);
  const remaining = useRef(LIFETIME);
  const started = useRef(0);
  const timer = useRef(0);

  const leave = useCallback(() => {
    clearTimeout(timer.current);
    setLeaving(true);
    setTimeout(() => onDone(toast.id), EXIT_MS);
  }, [onDone, toast.id]);

  const resume = useCallback(() => {
    started.current = Date.now();
    timer.current = setTimeout(leave, remaining.current);
  }, [leave]);

  const pause = () => {
    clearTimeout(timer.current);
    remaining.current -= Date.now() - started.current;
  };

  useEffect(() => {
    resume();
    return () => clearTimeout(timer.current);
  }, [resume]);

  return (
    <div
      role="status"
      onMouseEnter={pause}
      onMouseLeave={() => !leaving && resume()}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-full bg-ink py-2 pr-3 pl-2 text-sm text-on-ink shadow-[var(--shadow-pop)]",
        leaving ? "animate-[toast-out_0.32s_var(--ease-out)_forwards]" : "animate-[toast-in_0.55s_var(--ease-squish)_backwards]"
      )}
    >
      <span className={cn("grid size-7 shrink-0 place-items-center rounded-full", cls, "animate-[icon-pop_0.45s_var(--ease-squish)_0.08s_backwards]")}>
        <Icon className={cn("size-3.5", gesture)} strokeWidth={2.5} />
      </span>
      <p className="flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={leave}
        className="shrink-0 rounded-full p-1 text-on-ink/50 transition hover:text-on-ink"
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((toast) => toast.id !== id)), []);

  const push = useCallback((type, message) => {
    const id = ++nextId;
    setToasts((t) => [...t.slice(-3), { id, type, message }]);
  }, []);

  const toast = useMemo(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
      bye: (m) => push("bye", m),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-[100] flex flex-col items-center gap-2 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:items-end"
      >
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDone={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
