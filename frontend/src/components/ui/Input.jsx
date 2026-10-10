import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/cn";

export const fieldClasses =
  "h-12 w-full rounded-2xl border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-ink-faint " +
  "transition outline-none hover:border-line-strong focus:border-fill focus:ring-4 focus:ring-accent/50 " +
  "disabled:bg-soft disabled:text-ink-muted";

const Input = forwardRef(function Input({ label, hint, error, icon: Icon, type = "text", className, ...props }, ref) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={id} className="block text-[13px] font-semibold text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-subtle" />}
        <input
          ref={ref}
          id={id}
          type={isPassword && reveal ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={cn(fieldClasses, Icon && "pl-11", isPassword && "pr-11", error && "border-danger focus:ring-danger-soft")}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            className="absolute top-1/2 right-3.5 -translate-y-1/2 rounded-full p-1 text-ink-subtle transition hover:text-ink"
            aria-label={reveal ? "Hide password" : "Show password"}
          >
            {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {(error || hint) && (
        <p id={`${id}-msg`} className={cn("text-xs", error ? "text-danger" : "text-ink-subtle")}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

export default Input;
