import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";

// The Squish mark: a ball caught mid-squash
export function Blob({ size = 22, className, highlight = "var(--color-blob-highlight)" }) {
  return (
    <span className={cn("squish-hover inline-block shrink-0", className)} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-full">
        <ellipse cx="12" cy="14.5" rx="11" ry="8.5" fill="var(--color-blob)" />
        <ellipse cx="8.5" cy="11.6" rx="2.7" ry="1.6" fill={highlight} />
      </svg>
    </span>
  );
}

export default function Logo({ to = "/", size = 19, className }) {
  return (
    <Link
      to={to}
      className={cn("inline-flex items-center gap-2 font-display font-extrabold tracking-[-0.05em] text-ink", className)}
      style={{ fontSize: size }}
      aria-label="Squish home"
    >
      <Blob size={size * 1.2} />
      squish
    </Link>
  );
}
