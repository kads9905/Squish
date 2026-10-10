import { cn } from "../../lib/cn";

export default function Switch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {description && <span className="block text-xs text-ink-subtle">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn("squish relative h-7 w-12 shrink-0 rounded-full", checked ? "bg-fill" : "bg-soft-hover")}
      >
        <span
          className={cn(
            "absolute top-1 left-1 size-5 rounded-full shadow transition-transform duration-300 ease-[var(--ease-squish)]",
            checked ? "translate-x-5 bg-accent" : "bg-surface"
          )}
        />
      </button>
    </div>
  );
}
