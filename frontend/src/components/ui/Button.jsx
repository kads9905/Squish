import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

const VARIANTS = {
  // dark: a fading off-white button looks muddy, so disabled becomes a quiet tile instead
  primary: "bg-fill text-on-fill hover:bg-fill-hover dark:disabled:bg-soft-hover dark:disabled:text-ink-subtle dark:disabled:opacity-100",
  accent: "bg-accent text-ink hover:bg-accent-hover",
  secondary: "bg-soft text-ink hover:bg-soft-hover",
  outline: "border border-line-strong bg-surface text-ink hover:border-ink-subtle",
  ghost: "text-ink-muted hover:bg-soft hover:text-ink",
  danger: "bg-danger-soft text-danger hover:bg-danger hover:text-on-fill",
};

const SIZES = {
  sm: "h-9 gap-1.5 px-4 text-[13px]",
  md: "h-11 gap-2 px-5 text-sm",
  lg: "h-13 gap-2 px-7 text-[15px]",
  icon: "size-9",
};

const Button = forwardRef(function Button(
  { to, href, variant = "primary", size = "md", loading = false, className, children, disabled, type = "button", ...props },
  ref
) {
  const classes = cn(
    "squish group inline-flex shrink-0 items-center justify-center rounded-full font-semibold whitespace-nowrap select-none",
    "disabled:pointer-events-none disabled:opacity-45",
    VARIANTS[variant],
    SIZES[size],
    className
  );

  const content = (
    <>
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
});

export default Button;
