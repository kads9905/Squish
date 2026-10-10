import { cn } from "../../lib/cn";

const TONES = {
  neutral: "bg-soft text-ink-muted",
  accent: "bg-accent text-ink",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

export default function Badge({ tone = "neutral", dot = false, className, children }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", TONES[tone], className)}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const STATUS = {
  uploaded: { tone: "neutral", label: "Ready" },
  processing: { tone: "warning", label: "Squishing" },
  completed: { tone: "success", label: "Squished" },
  failed: { tone: "danger", label: "Failed" },
};

export function StatusBadge({ status, className }) {
  const s = STATUS[status] || STATUS.uploaded;
  return (
    <Badge tone={s.tone} dot className={className}>
      {s.label}
    </Badge>
  );
}
