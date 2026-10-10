import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../lib/cn";

// Sun/moon button that swaps with a little spin
export default function ThemeToggle({ className }) {
  const { resolved, toggle } = useTheme();
  const dark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={cn("squish relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full text-ink-muted hover:bg-soft hover:text-ink", className)}
    >
      <Sun
        className={cn(
          "absolute size-[18px] transition-all duration-500 ease-[var(--ease-squish)]",
          dark ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0"
        )}
      />
      <Moon
        className={cn(
          "absolute size-[18px] transition-all duration-500 ease-[var(--ease-squish)]",
          dark ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        )}
      />
    </button>
  );
}
