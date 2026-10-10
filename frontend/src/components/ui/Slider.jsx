import { cn } from "../../lib/cn";

export default function Slider({ value, min = 0, max = 100, step = 1, onChange, className, style, ...props }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn("squish-range", className)}
      // keep the fill under the thumb's centre at both ends
      style={{ "--fill": `calc(${pct}% + ${(0.5 - pct / 100) * 28}px)`, ...style }}
      {...props}
    />
  );
}
