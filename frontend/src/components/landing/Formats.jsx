import SectionHeading from "./SectionHeading";
import Reveal from "../ui/Reveal";
import { cn } from "../../lib/cn";

// level = how hard the format squishes, relative to the others (qualitative, not a benchmark)
const FORMATS = [
  { name: "AVIF", kind: "Image", level: 4, best: "The smallest photos. Supported by every modern browser." },
  { name: "WebP", kind: "Image", level: 3, best: "Fast, small and safe. A great default for the web." },
  { name: "JPEG", kind: "Image", level: 2, best: "Works absolutely everywhere — email, old apps, print." },
  { name: "PNG", kind: "Image", level: 1, best: "Logos and graphics that need transparency." },
  { name: "MP4", kind: "Video", level: 3, best: "H.264 with Small, Balanced or High presets, 1080p to 480p, optional mute." },
];

function Meter({ level }) {
  return (
    <span className="flex gap-1" aria-label={`Squish level ${level} of 4`}>
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={cn(
            "h-2.5 w-6 rounded-full transition-[transform,background-color] duration-300 ease-[var(--ease-squish)]",
            n <= level ? "bg-fill group-hover:scale-x-110 group-hover:scale-y-75 group-hover:bg-accent" : "bg-soft-hover"
          )}
          style={{ transitionDelay: `${n * 40}ms` }}
        />
      ))}
    </span>
  );
}

export default function Formats() {
  return (
    <section id="formats" className="scroll-mt-16 bg-surface py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Formats"
            title="Every format that matters."
            description="Not sure which to pick? Start with WebP. Go AVIF when every kilobyte counts."
          />
        </Reveal>

        <div className="border-t border-line">
          <div className="hidden grid-cols-[100px_1fr_auto] gap-6 border-b border-line py-3 text-xs font-semibold text-ink-subtle sm:grid">
            <span>Format</span>
            <span>Best for</span>
            <span>Squish level</span>
          </div>
          {FORMATS.map((f, i) => (
            <Reveal
              key={f.name}
              delay={i * 70}
              className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 border-b border-line py-5 sm:grid-cols-[100px_1fr_auto]"
            >
              <div>
                <p className="display text-2xl transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-1">{f.name}</p>
                <p className="text-xs text-ink-subtle">{f.kind}</p>
              </div>
              <p className="col-span-2 row-start-2 text-[15px] text-ink-muted sm:col-span-1 sm:row-start-auto">{f.best}</p>
              <Meter level={f.level} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
