import { Plus } from "lucide-react";
import SectionHeading from "./SectionHeading";
import Reveal from "../ui/Reveal";

const FAQS = [
  {
    q: "What can I squish?",
    a: "Images in JPG, PNG, WebP, AVIF and GIF, and videos in MP4, MOV, WebM and MKV — up to 500 MB per file.",
  },
  {
    q: "Will my photos look worse?",
    a: "At the default settings the difference is usually invisible. The before/after slider lets you check, and you can re-squish at a higher quality any time — your original is kept untouched.",
  },
  {
    q: "Where are my files stored?",
    a: "On the Squish server, visible only to your signed-in account. Delete a single file, a selection or your whole library whenever you like — originals and outputs are both removed.",
  },
  {
    q: "How long does a video take?",
    a: "It depends on length and resolution. Videos squish in the background with a live progress bar, so you can keep working and come back when it's done.",
  },
  {
    q: "Does it cost anything?",
    a: "No. Squish is free to use, with no watermarks.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Questions, answered." />
        </Reveal>
        <div className="mt-12 space-y-2">
          {FAQS.map(({ q, a }, i) => (
            <Reveal key={q} delay={i * 60}>
            <details className="group card px-6 transition-colors duration-300 open:pb-1 hover:border-line-strong">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
                {q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-soft transition-[transform,background-color] duration-300 ease-[var(--ease-squish)] group-open:rotate-45 group-open:bg-accent group-open:text-[#151413]">
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="animate-fade-up pr-12 pb-5 text-[15px] leading-relaxed text-ink-muted">{a}</p>
            </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
