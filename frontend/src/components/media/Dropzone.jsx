import { useRef, useState } from "react";
import { Blob } from "../ui/Logo";
import { cn } from "../../lib/cn";

export const ACCEPTED_TYPES = ".jpg,.jpeg,.png,.webp,.avif,.gif,.mp4,.mov,.webm,.mkv";
export const MAX_BYTES = 500 * 1024 * 1024;

export default function Dropzone({ onFile, disabled = false }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  const pick = (files) => {
    const file = files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) pick(e.dataTransfer.files);
      }}
      className={cn(
        "group flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-card)] border-2 border-dashed px-6 py-16 text-center transition-colors duration-200 sm:py-24",
        over ? "border-fill bg-accent-soft" : "border-line-strong bg-surface hover:border-ink-subtle",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      {/* the ball squashes when a file hovers over it */}
      <div
        className="mb-6 transition-transform duration-500 ease-[var(--ease-squish)]"
        style={{ transform: over ? "scale(1.3, 0.7)" : undefined, transformOrigin: "50% 100%" }}
      >
        <Blob size={64} />
      </div>
      <p className="display text-2xl">{over ? "Drop it. We'll squish it." : "Drop a photo or video"}</p>
      <p className="mt-2 text-sm text-ink-muted">
        or <span className="font-semibold text-ink underline decoration-accent decoration-[3px] underline-offset-4">browse your files</span>
      </p>
      <p className="mt-6 text-xs text-ink-subtle">JPG, PNG, WebP, AVIF, GIF, MP4, MOV, WebM · up to 500 MB</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
