import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";

/** Fades + lifts its children in the first time they scroll into view. */
export default function Reveal({ as: Tag = "div", delay = 0, className, style, children, ...props }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} data-shown={shown} className={cn("reveal", className)} style={{ "--reveal-delay": `${delay}ms`, ...style }} {...props}>
      {children}
    </Tag>
  );
}
