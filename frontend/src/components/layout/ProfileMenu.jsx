import { useEffect, useRef, useState } from "react";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { initials } from "../../lib/format";
import { cn } from "../../lib/cn";

export function Avatar({ name, className }) {
  return (
    <span
      className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-[#151413]", className)}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

const logoutItem =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger-soft focus-visible:bg-danger-soft focus-visible:outline-none";

/**
 * The account card at the foot of the sidebar. Clicking it opens a small menu
 * showing who you're signed in as, with Log out (settings and theme already
 * live in the sidebar). `placement`: "up" (sidebar), "right" (collapsed rail),
 * "down" (mobile header avatar).
 */
export default function ProfileMenu({ onLogout, placement = "up", compact = false }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        rootRef.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    rootRef.current?.querySelector('[role="menu"] [role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={cn(
          "squish flex items-center gap-3 rounded-[var(--radius-inner)] text-left",
          compact ? "rounded-full p-0.5" : "w-full p-3",
          !compact && (open ? "bg-soft" : "bg-paper hover:bg-soft")
        )}
      >
        <Avatar name={user?.fullName} />
        {!compact && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{user?.fullName}</span>
              <span className="block truncate text-xs text-ink-subtle">{user?.email}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-ink-subtle" />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className={cn(
            "absolute z-50 animate-pop-in rounded-[var(--radius-inner)] border border-line bg-surface p-1.5 shadow-[var(--shadow-pop)]",
            {
              up: "inset-x-0 bottom-full mb-2 origin-bottom",
              right: "bottom-0 left-full ml-3 w-[248px] origin-bottom-left",
              down: "top-full right-0 mt-2 w-[248px] origin-top-right",
            }[placement]
          )}
        >
          <div className="flex items-center gap-3 px-3 pt-2.5 pb-3">
            <Avatar name={user?.fullName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.fullName}</p>
              <p className="truncate text-xs text-ink-subtle">{user?.email}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-line" />
          <button role="menuitem" type="button" onClick={onLogout} className={logoutItem}>
            <LogOut className="size-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
