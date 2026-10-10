import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowRight, Download, Film, ImageIcon, Plus, RotateCcw } from "lucide-react";
import { PageHeader } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge, { StatusBadge } from "../../components/ui/Badge";
import SegmentedControl from "../../components/ui/SegmentedControl";
import Slider from "../../components/ui/Slider";
import Select from "../../components/ui/Select";
import Switch from "../../components/ui/Switch";
import ProgressBar from "../../components/ui/ProgressBar";
import Spinner from "../../components/ui/Spinner";
import SquishWord from "../../components/ui/SquishWord";
import Dropzone, { MAX_BYTES } from "../../components/media/Dropzone";
import CompareSlider from "../../components/media/CompareSlider";
import MediaThumb from "../../components/media/MediaThumb";
import { api, downloadUrl, mediaUrl, uploadMedia } from "../../lib/api";
import { formatBytes, formatRelative } from "../../lib/format";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../lib/cn";

const IMAGE_FORMATS = [
  { value: "webp", label: "WebP" },
  { value: "avif", label: "AVIF" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
];

const FORMAT_HINTS = {
  webp: "Fast, small, works everywhere on the web.",
  avif: "The smallest files. Takes a moment longer.",
  jpeg: "Maximum compatibility (MozJPEG).",
  png: "Keeps transparency. Best for graphics.",
};

const QUALITY_PRESETS = [
  { value: 50, label: "Tiny" },
  { value: 75, label: "Balanced" },
  { value: 90, label: "Crisp" },
];

const MAX_WIDTHS = [
  { value: "", label: "Keep original size" },
  { value: "3840", label: "3840 px (4K)" },
  { value: "2560", label: "2560 px" },
  { value: "1920", label: "1920 px (Full HD)" },
  { value: "1280", label: "1280 px" },
  { value: "800", label: "800 px" },
];

const VIDEO_PRESETS = [
  { value: "small", label: "Small" },
  { value: "balanced", label: "Balanced" },
  { value: "high", label: "High" },
];

const VIDEO_PRESET_HINTS = {
  small: "Squished hard — great for sharing and previews.",
  balanced: "Good quality at a fraction of the size.",
  high: "Near-source quality, gentler savings.",
};

const RESOLUTIONS = [
  { value: "original", label: "Source" },
  { value: "1080", label: "1080p" },
  { value: "720", label: "720p" },
  { value: "480", label: "480p" },
];

function Field({ label, value, children }) {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[13px] font-semibold">{label}</span>
        {value !== undefined && <span className="font-mono text-sm text-ink-muted tabular-nums">{value}</span>}
      </div>
      {children}
    </div>
  );
}

function Preview({ media }) {
  const done = media.status === "completed";
  const version = media.updatedAt;
  const [videoTab, setVideoTab] = useState("compressed");

  if (media.fileType === "image") {
    return done ? (
      <CompareSlider
        before={mediaUrl(media._id, "original")}
        after={mediaUrl(media._id, "compressed", version)}
        beforeLabel={`Original · ${formatBytes(media.originalSize)}`}
        afterLabel={`${media.outputFormat?.toUpperCase()} · ${formatBytes(media.compressedSize)}`}
      />
    ) : (
      <div className="bg-checker relative aspect-[16/10] overflow-hidden rounded-[var(--radius-inner)]">
        <img src={mediaUrl(media._id, "original")} alt="" className="absolute inset-0 size-full object-contain" />
      </div>
    );
  }

  const variant = done ? videoTab : "original";
  return (
    <div className="space-y-3">
      {done && (
        <SegmentedControl
          size="sm"
          className="max-w-sm"
          ariaLabel="Preview version"
          value={videoTab}
          onChange={setVideoTab}
          options={[
            { value: "original", label: `Original · ${formatBytes(media.originalSize)}` },
            { value: "compressed", label: `Squished · ${formatBytes(media.compressedSize)}` },
          ]}
        />
      )}
      <video
        key={variant + version}
        src={mediaUrl(media._id, variant, variant === "compressed" ? version : "")}
        controls
        playsInline
        className="aspect-video w-full rounded-[var(--radius-inner)] bg-black"
      />
    </div>
  );
}

export default function Studio() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const fileId = params.get("file");

  const [media, setMedia] = useState(null);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploading, setUploading] = useState(null); // { name, progress }
  const [submitting, setSubmitting] = useState(false);
  const [recent, setRecent] = useState([]);

  const [imageOpts, setImageOpts] = useState({ format: "webp", quality: 75, maxWidth: "" });
  const [videoOpts, setVideoOpts] = useState({ preset: "balanced", resolution: "original", mute: false });

  const loadRecent = useCallback(() => {
    api
      .history({ limit: 4 })
      .then((d) => setRecent(d.items))
      .catch(() => {});
  }, []);

  useEffect(loadRecent, [loadRecent]);

  // Load the file referenced in ?file=
  useEffect(() => {
    if (!fileId) {
      setMedia(null);
      return;
    }
    if (media?._id === fileId) return;
    setLoadingMedia(true);
    api
      .file(fileId)
      .then((m) => {
        setMedia(m);
        if (m.fileType === "image" && m.outputFormat) {
          setImageOpts((o) => ({ ...o, format: m.outputFormat, quality: m.quality ?? o.quality, maxWidth: m.resize ?? "" }));
        }
        if (m.fileType === "video" && m.preset) {
          setVideoOpts((o) => ({ ...o, preset: m.preset, resolution: m.resize ?? "original" }));
        }
      })
      .catch((err) => {
        toast.error(err.message);
        setParams({}, { replace: true });
      })
      .finally(() => setLoadingMedia(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  // Poll while a video job is running
  useEffect(() => {
    if (media?.status !== "processing") return;
    const timer = setInterval(async () => {
      try {
        const next = await api.file(media._id);
        setMedia(next);
        if (next.status === "completed") {
          toast.success(`Squished! Saved ${formatBytes(next.originalSize - next.compressedSize)}`);
          loadRecent();
        } else if (next.status === "failed") {
          toast.error(next.errorMessage || "Compression failed");
        }
      } catch {
        /* transient — try again next tick */
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [media?._id, media?.status, toast, loadRecent]);

  const onFile = async (file) => {
    if (file.size > MAX_BYTES) {
      toast.error("That file is over the 500 MB limit");
      return;
    }
    setUploading({ name: file.name, progress: 0 });
    try {
      const created = await uploadMedia(file, (progress) => setUploading({ name: file.name, progress }));
      setMedia(created);
      setParams({ file: created._id });
      loadRecent();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(null);
    }
  };

  const onCompress = async () => {
    setSubmitting(true);
    try {
      if (media.fileType === "image") {
        const result = await api.compressImage(media._id, {
          format: imageOpts.format,
          quality: imageOpts.quality,
          maxWidth: imageOpts.maxWidth ? Number(imageOpts.maxWidth) : null,
        });
        setMedia(result);
        toast.success(`Squished! Saved ${formatBytes(result.originalSize - result.compressedSize)}`);
        loadRecent();
      } else {
        const started = await api.compressVideo(media._id, videoOpts);
        setMedia(started);
        toast.info("Squishing your video — feel free to keep working.");
      }
    } catch (err) {
      toast.error(err.message);
      api.file(media._id).then(setMedia).catch(() => {});
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setMedia(null);
    setParams({});
  };

  // ── Upload ──────────────────────────────────────────────────────────
  if (!fileId) {
    return (
      <>
        <PageHeader title="Studio" description="Drop a file to start. Photos squish instantly; videos run in the background." />

        {uploading ? (
          <Card className="flex flex-col items-center px-6 py-20 text-center sm:py-24">
            <Spinner size={56} />
            <p className="display mt-8 text-2xl">Uploading…</p>
            <p className="mt-1 max-w-xs truncate text-sm text-ink-muted">{uploading.name}</p>
            <ProgressBar value={uploading.progress} className="mt-6 max-w-sm" />
            <p className="mt-2 font-mono text-sm text-ink-muted tabular-nums">{uploading.progress}%</p>
          </Card>
        ) : (
          <Dropzone onFile={onFile} />
        )}

        {recent.length > 0 && (
          <section className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold tracking-[-0.03em]">Recent</h2>
              <Link to="/app/library" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted transition hover:text-ink">
                Library <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {recent.map((f) => (
                <button
                  key={f._id}
                  onClick={() => setParams({ file: f._id })}
                  className="card card-hover group animate-fade-up overflow-hidden p-1.5 text-left"
                >
                  <MediaThumb file={f} className="aspect-[4/3] rounded-[var(--radius-inner)]" />
                  <div className="px-2 pt-2.5 pb-1.5">
                    <p className="truncate text-sm font-semibold">{f.originalName}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-xs text-ink-subtle">{formatRelative(f.createdAt)}</span>
                      {f.status === "completed" ? (
                        <Badge tone="accent">−{Math.max(0, Math.floor(f.compressionPercentage))}%</Badge>
                      ) : (
                        <StatusBadge status={f.status} />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </>
    );
  }

  if (loadingMedia || !media) {
    return (
      <>
        <PageHeader title="Studio" />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="skeleton aspect-[16/10] rounded-[var(--radius-card)]" />
          <div className="skeleton h-96 rounded-[var(--radius-card)]" />
        </div>
      </>
    );
  }

  // ── Editor ──────────────────────────────────────────────────────────
  const isImage = media.fileType === "image";
  const processing = media.status === "processing";
  const done = media.status === "completed";
  const grew = done && media.compressionPercentage < 0;

  return (
    <>
      <PageHeader
        title={
          isImage ? (
            <>
              <SquishWord quality={imageOpts.quality} origin="left" /> it.
            </>
          ) : (
            "Squish it."
          )
        }
        description="Tune the settings, squish, then compare."
        action={
          <Button variant="outline" onClick={reset}>
            <Plus className="size-4" /> New file
          </Button>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden p-2">
          <div className="flex items-center gap-3 px-3 pt-2 pb-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-soft">
              {isImage ? <ImageIcon className="size-4" /> : <Film className="size-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{media.originalName}</p>
              <p className="font-mono text-[11px] text-ink-subtle uppercase">
                {media.originalFormat} · {formatBytes(media.originalSize)}
                {media.width && media.height && ` · ${media.width}×${media.height}`}
              </p>
            </div>
            <StatusBadge status={media.status} />
          </div>
          <Preview media={media} />
        </Card>

        <div className="space-y-4 lg:sticky lg:top-12">
          <Card>
            <div className="space-y-6 p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-bold tracking-[-0.03em]">Settings</h2>
                <span className="text-xs font-semibold text-ink-subtle">{isImage ? "Image" : "Video · H.264 MP4"}</span>
              </div>

              {isImage ? (
                <>
                  <Field label="Format">
                    <SegmentedControl
                      ariaLabel="Output format"
                      options={IMAGE_FORMATS}
                      value={imageOpts.format}
                      onChange={(format) => setImageOpts({ ...imageOpts, format })}
                    />
                    <p className="mt-2 text-xs text-ink-subtle">{FORMAT_HINTS[imageOpts.format]}</p>
                  </Field>
                  <Field label="Quality" value={imageOpts.quality}>
                    <Slider
                      aria-label="Quality"
                      min={1}
                      max={100}
                      value={imageOpts.quality}
                      onChange={(quality) => setImageOpts({ ...imageOpts, quality })}
                    />
                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                      {QUALITY_PRESETS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setImageOpts({ ...imageOpts, quality: p.value })}
                          className={cn(
                            "squish rounded-full py-1.5 text-xs font-semibold",
                            imageOpts.quality === p.value ? "bg-accent text-ink" : "bg-soft text-ink-muted hover:text-ink"
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Max width">
                    <Select
                      ariaLabel="Max width"
                      options={MAX_WIDTHS}
                      value={imageOpts.maxWidth}
                      onChange={(maxWidth) => setImageOpts({ ...imageOpts, maxWidth })}
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Preset">
                    <SegmentedControl
                      ariaLabel="Video preset"
                      options={VIDEO_PRESETS}
                      value={videoOpts.preset}
                      onChange={(preset) => setVideoOpts({ ...videoOpts, preset })}
                    />
                    <p className="mt-2 text-xs text-ink-subtle">{VIDEO_PRESET_HINTS[videoOpts.preset]}</p>
                  </Field>
                  <Field label="Max resolution">
                    <SegmentedControl
                      ariaLabel="Max resolution"
                      options={RESOLUTIONS}
                      value={videoOpts.resolution}
                      onChange={(resolution) => setVideoOpts({ ...videoOpts, resolution })}
                    />
                  </Field>
                  <Switch
                    label="Remove audio"
                    description="For silent loops and backgrounds"
                    checked={videoOpts.mute}
                    onChange={(mute) => setVideoOpts({ ...videoOpts, mute })}
                  />
                </>
              )}

              {processing ? (
                <div className="rounded-[var(--radius-inner)] bg-paper p-4">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-semibold">Squishing…</span>
                    <span className="font-mono text-ink-muted tabular-nums">{media.progress || 0}%</span>
                  </div>
                  <ProgressBar value={media.progress || 0} indeterminate={!media.progress} />
                  <p className="mt-3 text-xs text-ink-subtle">You can leave this page — it keeps going.</p>
                </div>
              ) : (
                <Button size="lg" className="w-full" onClick={onCompress} loading={submitting}>
                  {done && <RotateCcw className="size-4" />}
                  {done ? "Squish again" : "Squish it"}
                </Button>
              )}
            </div>
          </Card>

          {done && (
            <div className={cn("animate-fade-up rounded-[var(--radius-card)] p-6", grew ? "bg-warning-soft" : "bg-accent")}>
              <p className="text-sm font-semibold">{grew ? "It got bigger" : "You saved"}</p>
              <p className="display mt-2 text-[44px] leading-none tabular-nums">
                {formatBytes(Math.abs(media.originalSize - media.compressedSize))}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[13px]">
                <div className="rounded-2xl bg-white/60 py-2.5">
                  <p className="text-xs text-ink/60">Before</p>
                  <p className="mt-0.5 font-mono font-medium">{formatBytes(media.originalSize)}</p>
                </div>
                <div className="rounded-2xl bg-white/60 py-2.5">
                  <p className="text-xs text-ink/60">After</p>
                  <p className="mt-0.5 font-mono font-medium">{formatBytes(media.compressedSize)}</p>
                </div>
                <div className="rounded-2xl bg-fill py-2.5 text-on-fill">
                  <p className="text-xs text-on-fill/60">{grew ? "Change" : "Lighter"}</p>
                  <p className="mt-0.5 font-mono font-medium">
                    {grew ? "+" : "−"}
                    {Math.abs(Math.floor(media.compressionPercentage))}%
                  </p>
                </div>
              </div>
              {grew && (
                <p className="mt-4 flex gap-2 text-xs text-warning">
                  <AlertTriangle className="size-4 shrink-0" />
                  Try a lower quality or a different format.
                </p>
              )}
              <Button href={downloadUrl(media._id)} size="lg" className="mt-5 w-full" download>
                <Download className="size-4" /> Download {media.outputFormat?.toUpperCase()}
              </Button>
            </div>
          )}

          {media.status === "failed" && (
            <div className="rounded-[var(--radius-card)] bg-danger-soft p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-danger">
                <AlertTriangle className="size-4" /> {media.errorMessage || "Compression failed"}
              </p>
              <p className="mt-1.5 text-xs text-ink-muted">Adjust the settings and try again.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
