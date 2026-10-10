/**
 * The word "Squish" that physically squashes as quality drops
 * (quality 100 → normal, 10 → flat and wide). Bounces once on mount.
 * origin "left" grows rightwards, "right" grows leftwards.
 */
export default function SquishWord({ quality = 100, origin = "right", delay = 250, children = "Squish" }) {
  const t = Math.min(1, Math.max(0, (100 - quality) / 90));
  const transformOrigin = origin === "left" ? "0% 100%" : "100% 100%";

  return (
    <span
      className="inline-block"
      style={{
        transformOrigin,
        transform: `scale(${1 + t * 0.22}, ${1 - t * 0.3})`,
        transition: "transform 0.5s var(--ease-squish)",
        // scale() doesn't affect layout, so reserve the extra width (~3.2em word × 0.22)
        [origin === "left" ? "marginRight" : "marginLeft"]: `${t * 0.72}em`,
      }}
    >
      <span className="inline-block animate-squish" style={{ transformOrigin, animationDelay: `${delay}ms` }}>
        {children}
      </span>
    </span>
  );
}
