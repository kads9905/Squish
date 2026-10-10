import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, description, children, footer }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("input")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-[2px] dark:bg-black/65" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="card relative w-full max-w-md animate-pop-in shadow-[var(--shadow-pop)]"
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2 id="modal-title" className="font-display text-xl font-bold tracking-[-0.03em]">
              {title}
            </h2>
            {description && <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="squish grid size-8 shrink-0 place-items-center rounded-full text-ink-subtle hover:bg-soft hover:text-ink"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        {children && <div className="px-6 pt-5">{children}</div>}
        {footer && <div className="flex justify-end gap-2 px-6 pt-6 pb-6">{footer}</div>}
      </div>
    </div>
  );
}
