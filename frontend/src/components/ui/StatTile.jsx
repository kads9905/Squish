import { useCountUp } from "../../hooks/useCountUp";
import { cn } from "../../lib/cn";

const asInteger = (n) => Math.round(n).toLocaleString();

/** `count` animates up from 0; `format` turns the running number into display text. */
export default function StatTile({ label, count, format = asInteger, sub, accent = false, loading = false }) {
  const animated = useCountUp(loading ? null : count);

  return (
    <div className={cn("rounded-[var(--radius-card)] p-5 transition-transform duration-300 ease-[var(--ease-out)] hover:-translate-y-0.5", accent ? "bg-accent" : "card")}>
      <p className={cn("text-[13px] font-semibold", accent ? "text-ink" : "text-ink-muted")}>{label}</p>
      {loading ? (
        <div className="skeleton mt-4 h-8 w-24" />
      ) : (
        <p className="display mt-3 animate-fade-in text-[32px] leading-none tabular-nums">{format(animated)}</p>
      )}
      {sub && <p className={cn("mt-2 text-xs", accent ? "text-ink/70" : "text-ink-subtle")}>{sub}</p>}
    </div>
  );
}
