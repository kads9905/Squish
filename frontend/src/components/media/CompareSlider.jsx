import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Two muted, looping clips kept frame-locked: the top one follows the bottom one. */
function SyncedVideos({ before, after, poster, fit, pos }) {
  const baseRef = useRef(null);
  const topRef = useRef(null);

  useEffect(() => {
    const base = baseRef.current;
    const top = topRef.current;
    if (!base || !top) return;
    const autoplay = !prefersReducedMotion();

    // React doesn't reliably reflect `muted`, and browsers only autoplay muted media
    for (const v of [base, top]) {
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute("muted", "");
    }

    const play = (v) => v.play().catch(() => {});
    if (autoplay) play(base);

    // a steady tick is more dependable than timeupdate (which can be throttled)
    const timer = setInterval(() => {
      if (top.readyState < 2) return;
      if (Math.abs(top.currentTime - base.currentTime) > 0.15) top.currentTime = base.currentTime;
      if (base.paused && !top.paused) top.pause();
      if (!base.paused && top.paused) play(top);
    }, 250);

    return () => clearInterval(timer);
  }, [before, after]);

  const common = { muted: true, loop: true, playsInline: true, preload: "auto", poster, draggable: false };
  return (
    <>
      <video ref={baseRef} src={before} autoPlay={!prefersReducedMotion()} {...common} className={cn("absolute inset-0 z-0 size-full", fit)} />
      <video
        ref={topRef}
        src={after}
        {...common}
        className={cn("absolute inset-0 size-full", fit)}
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
      />
    </>
  );
}

/**
 * Before/after comparison for images or videos. The "after" layer sits on top and is
 * clipped from the left, so dragging right reveals more of the original.
 */
export default function CompareSlider({
  before,
  after,
  kind = "image",
  poster,
  beforeLabel = "Original",
  afterLabel = "Squished",
  className,
  aspect = "aspect-[16/10]",
  fit = "object-contain",
}) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const ref = useRef(null);

  const update = useCallback((clientX) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  return (
    <div
      ref={ref}
      className={cn("bg-checker relative isolate cursor-ew-resize touch-none overflow-hidden rounded-[var(--radius-inner)] select-none", aspect, className)}
      onPointerDown={(e) => {
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX);
      }}
      onPointerMove={(e) => dragging && update(e.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      {kind === "video" ? (
        <SyncedVideos before={before} after={after} poster={poster} fit={fit} pos={pos} />
      ) : (
        <>
          {before && <img src={before} alt={beforeLabel} draggable={false} className={cn("absolute inset-0 size-full", fit)} />}
          {after && (
            <img
              src={after}
              alt={afterLabel}
              draggable={false}
              className={cn("absolute inset-0 size-full animate-fade-in", fit)}
              style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
            />
          )}
        </>
      )}

      <span className="absolute top-3 left-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#151413] backdrop-blur">
        {beforeLabel}
      </span>
      <span
        key={afterLabel}
        className="absolute top-3 right-3 z-10 animate-pop-in rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-[#151413]"
      >
        {afterLabel}
      </span>

      {/* z-20 keeps the bar above the <video> layers, which GPU compositing can otherwise paint on top */}
      <div className="absolute inset-y-0 z-20 w-[3px] -translate-x-1/2 bg-white" style={{ left: `${pos}%` }}>
        <button
          type="button"
          role="slider"
          aria-label="Comparison position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
            if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
          }}
          className={cn(
            "absolute top-1/2 left-1/2 grid h-9 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full border-[3px] border-white bg-[#151413] text-[13px] font-bold text-white shadow-lg transition-transform duration-300 ease-[var(--ease-squish)]",
            dragging ? "scale-x-125 scale-y-90" : "hover:scale-110"
          )}
        >
          ⟷
        </button>
      </div>
    </div>
  );
}
