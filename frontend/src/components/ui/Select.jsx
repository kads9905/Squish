import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Squish dropdown (replaces the native <select>, whose menu can't be styled).
 * options: [{ value, label }] · onChange receives the new value.
 * Keyboard: ↑/↓ Home/End to move, Enter/Space to pick, Esc/Tab to close, type to jump.
 */
export default function Select({ options, value, onChange, className, ariaLabel, placeholder = "Select…" }) {
  const id = useId();
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const typeahead = useRef({ text: "", timer: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [dropUp, setDropUp] = useState(false);

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );
  const selected = options.find((o) => o.value === value);

  const openMenu = () => {
    const rect = rootRef.current.getBoundingClientRect();
    // open upwards when there isn't room for the menu below the trigger
    setDropUp(window.innerHeight - rect.bottom < Math.min(320, options.length * 44 + 24) && rect.top > window.innerHeight / 2);
    setActive(selectedIndex);
    setOpen(true);
  };

  const pick = (index) => {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    setOpen(false);
    rootRef.current?.querySelector("button")?.focus();
  };

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // keep the highlighted option in view
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        pick(active);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (e.key.length === 1) {
          // typeahead: jump to the first option starting with the typed letters
          const t = typeahead.current;
          clearTimeout(t.timer);
          t.text += e.key.toLowerCase();
          t.timer = setTimeout(() => (t.text = ""), 600);
          const hit = options.findIndex((o) => o.label.toLowerCase().startsWith(t.text));
          if (hit >= 0) setActive(hit);
        }
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={cn(
          "squish flex h-11 w-full items-center justify-between gap-2 rounded-full border bg-surface pr-3.5 pl-4 text-left text-sm font-semibold outline-none",
          open ? "border-fill ring-4 ring-accent/50" : "border-line hover:border-line-strong"
        )}
      >
        <span className={cn("truncate", !selected && "text-ink-faint")}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-ink-subtle transition-transform duration-300 ease-[var(--ease-squish)]", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-label={ariaLabel}
          aria-activedescendant={`${id}-opt-${active}`}
          tabIndex={-1}
          className={cn(
            "absolute right-0 left-0 z-40 max-h-72 min-w-max animate-pop-in overflow-auto rounded-[var(--radius-inner)] border border-line bg-surface p-1.5 shadow-[var(--shadow-pop)]",
            dropUp ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"
          )}
        >
          {options.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActive(i)}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => pick(i)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-6 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  i === active ? "bg-soft text-ink" : "text-ink-muted",
                  isSelected && "font-semibold text-ink"
                )}
              >
                {o.label}
                <span className={cn("grid size-5 place-items-center rounded-full transition-all duration-300 ease-[var(--ease-squish)]", isSelected ? "scale-100 bg-accent text-[#151413]" : "scale-0")}>
                  <Check className="size-3" strokeWidth={3} />
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
