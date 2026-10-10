import { cn } from "../../lib/cn";

// Pill radio group. options: [{ value, label, disabled? }]
export default function SegmentedControl({ options, value, onChange, size = "md", className, ariaLabel }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("flex w-full gap-1 rounded-full bg-soft p-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "squish flex-1 rounded-full font-semibold whitespace-nowrap disabled:opacity-40",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-3 py-2 text-[13px]",
              active ? "bg-fill text-on-fill" : "text-ink-muted hover:text-ink"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
