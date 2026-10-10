import { Check, Download, ImageIcon } from "lucide-react";
import SectionHeading from "./SectionHeading";
import Reveal from "../ui/Reveal";
import { Blob } from "../ui/Logo";

/* Each step is a small, static slice of the real UI that plays a short
   animation when its card is hovered (or focused). */

const DropVignette = () => (
  <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[var(--radius-inner)] border-2 border-dashed border-line-strong bg-surface transition-colors duration-300 group-hover:border-fill group-hover:bg-accent-soft group-focus-within:border-fill">
    {/* a file chip sliding in, as if being dragged over */}
    <span className="absolute top-4 right-4 flex translate-x-6 -translate-y-2 rotate-6 items-center gap-1.5 rounded-full bg-chip px-3 py-1.5 text-xs font-semibold text-on-chip opacity-0 shadow-[var(--shadow-pop)] transition-all duration-500 ease-[var(--ease-squish)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:rotate-0 group-hover:opacity-100">
      <ImageIcon className="size-3.5" /> sunrise.png
    </span>
    <span className="origin-bottom group-hover:animate-[ball-drop_0.9s_var(--ease-out)]">
      <Blob size={44} />
    </span>
    <p className="mt-3 text-sm font-semibold">
      <span className="group-hover:hidden">Drop a photo or video</span>
      <span className="hidden group-hover:inline">Drop it. We'll squish it.</span>
    </p>
  </div>
);

const TuneVignette = () => (
  <div className="flex h-full flex-col justify-center gap-5 rounded-[var(--radius-inner)] bg-surface p-5">
    {/* segmented control whose pill slides from WebP to AVIF */}
    <div className="relative grid grid-cols-4 rounded-full bg-soft p-1 text-center text-xs font-semibold">
      <span className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/4)] rounded-full bg-fill transition-transform duration-500 ease-[var(--ease-squish)] group-hover:translate-x-full" />
      <span className="relative py-1.5 text-on-fill transition-colors duration-300 group-hover:text-ink-muted">WebP</span>
      <span className="relative py-1.5 text-ink-muted transition-colors duration-300 group-hover:text-on-fill">AVIF</span>
      <span className="relative py-1.5 text-ink-muted">JPEG</span>
      <span className="relative py-1.5 text-ink-muted">PNG</span>
    </div>
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <span className="font-semibold">Quality</span>
        <span className="relative font-mono text-ink-muted">
          <span className="transition-opacity duration-300 group-hover:opacity-0">72</span>
          <span className="absolute right-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">38</span>
        </span>
      </div>
      <div className="relative h-6 rounded-full bg-soft">
        <div className="h-full w-[72%] rounded-full bg-accent transition-[width] duration-700 ease-[var(--ease-squish)] group-hover:w-[38%]" />
        <span className="absolute top-0 left-[72%] size-6 -translate-x-1/2 rounded-full border-4 border-surface bg-fill shadow transition-[left] duration-700 ease-[var(--ease-squish)] group-hover:left-[38%]" />
      </div>
    </div>
  </div>
);

const DownloadVignette = () => (
  <div className="flex h-full flex-col items-center justify-center gap-4 rounded-[var(--radius-inner)] bg-surface p-5">
    <p className="flex items-center gap-2 font-mono text-sm text-ink-muted">
      <span className="relative">
        12.4 MB
        <span className="absolute top-1/2 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-ink-muted transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-x-100" />
      </span>
      <span>→</span>
      <span className="rounded-full px-2 py-0.5 text-ink transition-all duration-500 ease-[var(--ease-squish)] group-hover:scale-110 group-hover:bg-accent group-hover:text-[#151413]">
        1.1 MB
      </span>
    </p>
    <span className="inline-flex items-center gap-2 rounded-full bg-fill px-5 py-2.5 text-sm font-semibold text-on-fill transition-transform duration-300 ease-[var(--ease-squish)] group-hover:scale-x-105 group-hover:scale-y-95">
      <Download className="size-4 group-hover:animate-bounce" /> Download AVIF
    </span>
    <span className="flex translate-y-2 items-center gap-1.5 text-xs font-semibold text-success opacity-0 transition-all delay-150 duration-500 ease-[var(--ease-out)] group-hover:translate-y-0 group-hover:opacity-100">
      <Check className="size-3.5" strokeWidth={3} /> Saved 11.3 MB
    </span>
  </div>
);

const STEPS = [
  {
    title: "Drop it in",
    body: "Drag in an image or video up to 500 MB. It lands in your library straight away.",
    visual: DropVignette,
  },
  {
    title: "Pick how squished",
    body: "Choose a format and quality, or a video preset. The defaults are already good.",
    visual: TuneVignette,
  },
  {
    title: "Compare, then keep it",
    body: "Drag across the before/after, check what you saved, and download.",
    visual: DownloadVignette,
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-16 bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="Three steps. No settings maze."
            description="Squish keeps the controls you need and hides the rest. Hover a step to see it."
          />
        </Reveal>

        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {STEPS.map(({ title, body, visual: Visual }, i) => (
            <Reveal as="li" key={title} delay={i * 110}>
              <div tabIndex={0} className="card card-hover group flex h-full flex-col p-3 outline-none focus-visible:ring-4 focus-visible:ring-accent/60">
                <div className="aspect-[4/3] rounded-[var(--radius-inner)] bg-paper p-3">
                  <Visual />
                </div>
                <div className="flex gap-4 px-3 pt-5 pb-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent font-mono text-sm font-medium text-[#151413] transition-transform duration-500 ease-[var(--ease-squish)] group-hover:scale-x-125 group-hover:scale-y-75">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-[-0.03em]">{title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-ink-muted">{body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
