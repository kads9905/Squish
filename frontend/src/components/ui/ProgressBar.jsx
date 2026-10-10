import { cn } from "../../lib/cn";

export default function ProgressBar({ value, indeterminate = false, className }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : value}
      className={cn("relative h-3 w-full overflow-hidden rounded-full bg-soft", className)}
    >
      {indeterminate ? (
        <div className="absolute inset-y-0 w-1/3 animate-[indeterminate_1.3s_ease-in-out_infinite] rounded-full bg-accent" />
      ) : (
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${Math.max(4, value)}%` }} />
      )}
    </div>
  );
}
