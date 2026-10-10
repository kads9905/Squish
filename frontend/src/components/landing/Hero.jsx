import { useState } from "react";
import { ArrowRight, ImageIcon, Play, Search } from "lucide-react";
import Button from "../ui/Button";
import SquishWord from "../ui/SquishWord";
import SegmentedControl from "../ui/SegmentedControl";
import Slider from "../ui/Slider";
import { Blob } from "../ui/Logo";
import CompareSlider from "../media/CompareSlider";
import { useAuth } from "../../context/AuthContext";
import { formatBytes } from "../../lib/format";
// real sizes of /public/demo/<clip>/crf-*.mp4 — each clip encoded with the backend's own H.264 settings
import SIZES from "../../lib/demoVideos.json";

const CLIPS = [
  { value: "cartoon", label: "Cartoon" },
  { value: "mountains", label: "Mountains" },
];

// the encoded clips, best quality → most squished; `quality` is the 10–100 slider value each one matches
const LEVELS = [
  { crf: 17, quality: 95 },
  { crf: 22, quality: 85 },
  { crf: 25, quality: 75 },
  { crf: 27, quality: 65 },
  { crf: 30, quality: 50 },
  { crf: 32, quality: 35 },
  { crf: 36, quality: 20 },
];

// the backend presets map onto three of the clips
const PRESETS = [
  { value: "small", label: "Small", quality: 35 },
  { value: "balanced", label: "Balanced", quality: 65 },
  { value: "high", label: "High", quality: 85 },
];

// the slider is continuous; play whichever real encode is closest to the chosen quality
const nearestLevel = (q) =>
  LEVELS.reduce((best, l, i) => (Math.abs(l.quality - q) < Math.abs(LEVELS[best].quality - q) ? i : best), 0);

const sizeAt = (clip, level) => SIZES[clip].crf[LEVELS[level].crf];
const savingAt = (clip, level) => Math.floor(100 - (sizeAt(clip, level) / SIZES[clip].original) * 100);

/** Headline pieces rise in one after another and settle with a small squash. */
const Rise = ({ i, children }) => (
  <span className="inline-block animate-[word-rise_0.75s_var(--ease-out)_backwards]" style={{ animationDelay: `${i * 70}ms` }}>
    {children}
  </span>
);

/** Two matching outlined file tiles fanned like a little stack — they splay out on hover. */
function FileStack() {
  const tile =
    "absolute top-0 grid h-full w-[0.72em] place-items-center rounded-[0.2em] border-[0.06em] border-ink transition-transform duration-500 ease-[var(--ease-squish)]";
  return (
    <span className="group/stack relative mx-[0.1em] inline-block h-[0.8em] w-[1.3em] -translate-y-[0.06em] align-middle" aria-hidden="true">
      <span className={`${tile} left-0 -rotate-[9deg] bg-accent group-hover/stack:-translate-x-[0.06em] group-hover/stack:-rotate-[16deg]`}>
        <Play className="size-[0.32em] fill-ink text-ink" strokeWidth={2.5} />
      </span>
      <span className={`${tile} right-0 rotate-[7deg] bg-surface group-hover/stack:translate-x-[0.06em] group-hover/stack:rotate-[14deg]`}>
        <ImageIcon className="size-[0.36em] text-ink" strokeWidth={2.5} />
      </span>
    </span>
  );
}

/** "files" with the saving stuck on its corner like a price sticker. */
function StickeredWord({ children, sticker, stickerKey }) {
  return (
    <span className="relative inline-block">
      {children}
      <span
        key={stickerKey}
        className="absolute -top-[0.34em] -right-[0.55em] inline-block rotate-[12deg] animate-pop-in rounded-full border-[0.025em] border-ink bg-accent px-[0.32em] py-[0.1em] font-mono text-[0.2em] leading-none font-semibold tracking-normal whitespace-nowrap text-[#151413] shadow-[0_0.08em_0_0_var(--color-ink)]"
      >
        {sticker}
      </span>
    </span>
  );
}

export default function Hero() {
  const { user } = useAuth();
  const [clip, setClip] = useState("cartoon");
  const [quality, setQuality] = useState(65);
  const level = nearestLevel(quality);
  const { crf } = LEVELS[level];
  const preset = PRESETS.find((p) => p.quality === quality)?.value ?? "";

  return (
    <section className="overflow-hidden bg-surface">
      <div className="mx-auto max-w-[1240px] px-5 pt-14 text-center sm:px-8 md:pt-20">
        <h1 className="display mx-auto max-w-[1100px] text-[clamp(40px,6.4vw,92px)] leading-[1.02]">
          <Rise i={0}>
            <SquishWord quality={quality} origin="right" delay={650} />
          </Rise>{" "}
          <Rise i={1}>your</Rise>{" "}
          <Rise i={2}>
            <FileStack />
          </Rise>{" "}
          <Rise i={3}>
            <StickeredWord sticker={`−${savingAt(clip, level)}%`} stickerKey={`${clip}-${level}`}>
              files
            </StickeredWord>
          </Rise>
          <br />
          <span className="text-ink-faint">
            <Rise i={4}>Not</Rise> <Rise i={5}>your</Rise> <Rise i={6}>pixels.</Rise>
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-md animate-fade-up text-[17px] leading-[1.55] text-ink-muted [animation-delay:80ms]">
          Squish shrinks photos and videos to WebP, AVIF and MP4 in a couple of clicks — and shows you the result before
          you download.
        </p>

        <div className="mt-8 flex animate-fade-up flex-col justify-center gap-2.5 [animation-delay:160ms] sm:flex-row">
          <Button to={user ? "/app" : "/register"} size="lg">
            {user ? "Open studio" : "Start squishing"} <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Button>
          <Button href="#how" variant="secondary" size="lg">
            How it works
          </Button>
        </div>
        <p className="mt-4 animate-fade-up text-xs text-ink-subtle [animation-delay:220ms]">Free · no watermarks · files up to 500 MB</p>

        {/* a working mini studio playing a real before/after video */}
        <div className="mx-auto mt-14 max-w-[1040px] animate-fade-up rounded-t-[36px] bg-accent-soft p-2.5 pb-0 [animation-delay:300ms] sm:p-3 sm:pb-0 md:mt-16">
          <div className="overflow-hidden rounded-t-[26px] border border-b-0 border-line bg-surface text-left">
            <div className="flex items-center justify-between border-b border-line px-4 py-3 text-[13px] sm:px-5">
              <div className="flex items-center gap-5">
                <Blob size={20} />
                <span className="font-semibold">Studio</span>
                <span className="text-ink-subtle">Library</span>
              </div>
              <div className="hidden w-60 items-center gap-2 rounded-full bg-soft px-3.5 py-1.5 text-ink-subtle sm:flex">
                <Search className="size-3.5" /> Search files…
              </div>
              <span className="grid size-7 place-items-center rounded-full bg-accent text-[11px] font-bold">Sq</span>
            </div>

            <div className="grid gap-3 p-3 sm:p-4 md:grid-cols-[1fr_290px]">
              <CompareSlider
                kind="video"
                before={`/demo/${clip}/original.mp4`}
                after={`/demo/${clip}/crf-${crf}.mp4`}
                poster={`/demo/${clip}/poster.jpg`}
                fit="object-cover"
                beforeLabel={`Original · ${formatBytes(SIZES[clip].original)}`}
                afterLabel={`CRF ${crf} · ${formatBytes(sizeAt(clip, level))}`}
                className="bg-soft"
              />

              <div className="flex flex-col gap-3">
                <div className="rounded-[var(--radius-inner)] bg-paper p-4">
                  <p className="text-[13px] font-semibold">Clip</p>
                  <SegmentedControl className="mt-2.5 bg-surface" size="sm" ariaLabel="Demo clip" value={clip} onChange={setClip} options={CLIPS} />
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[13px] font-semibold">Preset</p>
                    <span className="text-xs text-ink-subtle">H.264 · MP4</span>
                  </div>
                  <SegmentedControl
                    className="mt-2.5 bg-surface"
                    size="sm"
                    ariaLabel="Demo preset"
                    value={preset}
                    onChange={(value) => setQuality(PRESETS.find((p) => p.value === value).quality)}
                    options={PRESETS}
                  />
                  <div className="mt-4 mb-2 flex items-center justify-between text-[13px]">
                    <span className="font-semibold">Quality</span>
                    <span className="font-mono text-ink-muted">{quality}</span>
                  </div>
                  <Slider value={quality} min={10} max={100} onChange={setQuality} aria-label="Demo quality" />
                  <p className="mt-2.5 text-xs text-ink-subtle">Drag it down and watch the headline.</p>
                </div>

                <div className="rounded-[var(--radius-inner)] bg-paper p-4 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Before</span>
                    <span className="font-mono">{formatBytes(SIZES[clip].original)}</span>
                  </div>
                  <div className="mt-1.5 flex justify-between">
                    <span className="text-ink-muted">After</span>
                    <span key={`${clip}-${level}`} className="animate-fade-in font-mono">
                      {formatBytes(sizeAt(clip, level))}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                    <span className="font-semibold">Saved</span>
                    <span key={`${clip}-${level}`} className="animate-pop-in rounded-full bg-accent px-2.5 py-0.5 font-mono font-medium">
                      −{savingAt(clip, level)}%
                    </span>
                  </div>
                </div>

                <p className="px-1 text-xs text-ink-subtle">Drag the handle across the video to compare.</p>

                <Button to={user ? "/app" : "/register"} className="mt-auto w-full">
                  Squish your own file
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
