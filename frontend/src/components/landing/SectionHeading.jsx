import { cn } from "../../lib/cn";

export default function SectionHeading({ eyebrow, title, description, align = "center", className }) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="display mt-3 text-[clamp(36px,4.6vw,60px)] leading-[1.02] text-balance">{title}</h2>
      {description && <p className="mt-4 text-[17px] leading-relaxed text-pretty text-ink-muted">{description}</p>}
    </div>
  );
}
