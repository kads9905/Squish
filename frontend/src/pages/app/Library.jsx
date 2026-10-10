import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Download, Search, SlidersHorizontal, Trash2, Upload } from "lucide-react";
import { PageHeader } from "../../components/layout/AppLayout";
import Button from "../../components/ui/Button";
import Badge, { StatusBadge } from "../../components/ui/Badge";
import SegmentedControl from "../../components/ui/SegmentedControl";
import Select from "../../components/ui/Select";
import StatTile from "../../components/ui/StatTile";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import MediaThumb from "../../components/media/MediaThumb";
import { fieldClasses } from "../../components/ui/Input";
import { api, downloadUrl } from "../../lib/api";
import { formatBytes, formatRelative } from "../../lib/format";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../lib/cn";

const PAGE_SIZE = 12;

const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "completed", label: "Squished" },
  { value: "uploaded", label: "Not squished yet" },
  { value: "processing", label: "Squishing" },
  { value: "failed", label: "Failed" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "largest", label: "Largest first" },
  { value: "savings", label: "Biggest savings" },
];

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function FileCard({ file, index = 0, selected, onToggle, onOpen, onDelete }) {
  const done = file.status === "completed";
  return (
    <article
      className={cn("card card-hover group relative animate-fade-up p-1.5", selected && "border-fill hover:border-fill")}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <button onClick={onOpen} className="block w-full text-left" aria-label={`Open ${file.originalName} in studio`}>
        <MediaThumb
          file={file}
          className="aspect-[4/3] rounded-[var(--radius-inner)] [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-[var(--ease-out)] group-hover:[&_img]:scale-[1.04]"
        />
      </button>

      <button
        onClick={onToggle}
        role="checkbox"
        aria-checked={selected}
        aria-label={`Select ${file.originalName}`}
        className={cn(
          "squish absolute top-4 left-4 grid size-7 place-items-center rounded-full border-2",
          selected
            ? "border-fill bg-fill text-on-fill"
            : "border-white bg-white/70 text-transparent backdrop-blur dark:border-line-strong dark:bg-surface/70 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        )}
      >
        <Check className="size-3.5" strokeWidth={3} />
      </button>

      <div className="absolute top-4 right-4">
        <StatusBadge status={file.status} className="bg-surface" />
      </div>

      <div className="px-2.5 pt-3 pb-2">
        <p className="truncate font-semibold" title={file.originalName}>
          {file.originalName}
        </p>
        <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-ink-subtle">
          {formatBytes(file.originalSize)}
          {done && (
            <>
              <ChevronRight className="size-3" />
              <span className="text-ink">{formatBytes(file.compressedSize)}</span>
            </>
          )}
          <span className="ml-auto font-sans">{formatRelative(file.createdAt)}</span>
        </p>

        <div className="mt-3 flex items-center gap-1">
          {done ? (
            <Badge tone={file.compressionPercentage >= 0 ? "accent" : "warning"}>
              {file.compressionPercentage >= 0 ? "−" : "+"}
              {Math.abs(Math.floor(file.compressionPercentage))}% · {file.outputFormat?.toUpperCase()}
            </Badge>
          ) : (
            <Badge>{file.originalFormat?.toUpperCase()}</Badge>
          )}
          <div className="ml-auto flex items-center">
            <Button variant="ghost" size="icon" onClick={onOpen} aria-label="Open in studio" title="Open in studio">
              <SlidersHorizontal className="size-4" />
            </Button>
            {done && (
              <Button href={downloadUrl(file._id)} download variant="ghost" size="icon" aria-label="Download" title="Download">
                <Download className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-danger-soft hover:text-danger"
              onClick={onDelete}
              disabled={file.status === "processing"}
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Library() {
  const toast = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [confirm, setConfirm] = useState(null); // { ids, label }
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search);
  const requestId = useRef(0);

  const load = useCallback(
    async (silent = false) => {
      const id = ++requestId.current;
      if (!silent) setLoading(true);
      try {
        const [history, s] = await Promise.all([
          api.history({ page, limit: PAGE_SIZE, type, status, sort, search: debouncedSearch }),
          api.stats(),
        ]);
        // ignore responses that were superseded by a newer request
        if (id !== requestId.current) return;
        setData(history);
        setStats(s);
      } catch (err) {
        if (id === requestId.current) toast.error(err.message);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [page, type, status, sort, debouncedSearch, toast]
  );

  useEffect(() => {
    load();
  }, [load]);

  // reset to page 1 when filters change (skip the initial mount)
  const filterKey = `${type}|${status}|${sort}|${debouncedSearch}`;
  const lastFilterKey = useRef(filterKey);
  if (lastFilterKey.current !== filterKey) {
    lastFilterKey.current = filterKey;
    if (page !== 1) setPage(1);
  }

  // keep processing jobs fresh
  const hasProcessing = data?.items.some((f) => f.status === "processing");
  useEffect(() => {
    if (!hasProcessing) return;
    const t = setInterval(() => load(true), 3000);
    return () => clearInterval(t);
  }, [hasProcessing, load]);

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const onConfirmDelete = async () => {
    setDeleting(true);
    try {
      const ids = confirm.ids;
      if (ids.length === 1) {
        await api.deleteFile(ids[0]);
        toast.success("File deleted");
      } else {
        const { deletedCount } = await api.bulkDelete(ids);
        toast.success(`${plural(deletedCount, "file")} deleted`);
      }
      setSelected(new Set());
      setConfirm(null);
      // step back if we just emptied the last page
      if (data.items.length === ids.length && page > 1) setPage((p) => p - 1);
      else load(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = Boolean(debouncedSearch || type || status);
  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <PageHeader
        title="Library"
        description="Everything you've uploaded, and how much it squished."
        action={
          <Button onClick={() => navigate("/app")}>
            <Upload className="size-4" /> Upload
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          accent
          label="Space saved"
          loading={!stats}
          count={stats?.bytesSaved}
          format={(n) => formatBytes(n)}
          sub={stats && `from ${formatBytes(stats.originalBytes)} of originals`}
        />
        <StatTile label="Avg. squish" loading={!stats} count={stats?.avgReduction} format={(n) => `${Math.floor(n)}%`} sub="smaller, on average" />
        <StatTile
          label="Files"
          loading={!stats}
          count={stats?.totalFiles}
          sub={stats && `${plural(stats.images, "image")} · ${plural(stats.videos, "video")}`}
        />
        <StatTile
          label="Squished"
          loading={!stats}
          count={stats?.completed}
          sub={stats && (stats.failed ? `${stats.failed} failed` : "no failures")}
        />
      </div>

      {/* toolbar */}
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file name…"
            aria-label="Search files"
            className={cn(fieldClasses, "h-11 rounded-full pl-11 text-sm")}
          />
        </div>
        <SegmentedControl
          className="bg-surface lg:w-64"
          ariaLabel="File type"
          value={type}
          onChange={setType}
          options={[
            { value: "", label: "All" },
            { value: "image", label: "Images" },
            { value: "video", label: "Videos" },
          ]}
        />
        <div className="grid grid-cols-2 gap-3 lg:flex">
          <Select ariaLabel="Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} className="lg:w-48" />
          <Select ariaLabel="Sort" options={SORT_OPTIONS} value={sort} onChange={setSort} className="lg:w-44" />
        </div>
      </div>

      {/* selection bar */}
      {selected.size > 0 && (
        <div className="mt-4 flex animate-fade-up items-center justify-between gap-3 rounded-full bg-ink py-2 pr-2 pl-5 text-on-ink">
          <p className="text-sm">
            <span className="font-semibold text-accent">{selected.size}</span> selected
          </p>
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" className="text-on-ink/70 hover:bg-on-ink/10 hover:text-on-ink" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
            <Button variant="accent" size="sm" onClick={() => setConfirm({ ids: [...selected], label: plural(selected.size, "file") })}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* grid */}
      <div className="mt-6">
        {loading && !data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-80 rounded-[var(--radius-card)]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card">
            {filtered ? (
              <EmptyState
                title="Nothing matches."
                description="Try a different search, or clear the filters."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearch("");
                      setType("");
                      setStatus("");
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="Nothing squished yet."
                description="Upload a photo or video in the studio and it'll show up here."
                action={<Button onClick={() => navigate("/app")}>Go to studio</Button>}
              />
            )}
          </div>
        ) : (
          <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", loading && "opacity-60 transition-opacity")}>
            {items.map((file, i) => (
              <FileCard
                index={i}
                key={file._id}
                file={file}
                selected={selected.has(file._id)}
                onToggle={() => toggle(file._id)}
                onOpen={() => navigate(`/app?file=${file._id}`)}
                onDelete={() => setConfirm({ ids: [file._id], label: file.originalName })}
              />
            ))}
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-ink-muted">
            Page {pagination.page} of {pagination.totalPages} · {plural(pagination.total, "file")}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={!!confirm}
        onClose={() => !deleting && setConfirm(null)}
        title="Delete for good?"
        description={`${confirm?.label} will be removed, along with any squished copy. This can't be undone.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirmDelete} loading={deleting}>
              <Trash2 className="size-4" /> Delete
            </Button>
          </>
        }
      />
    </>
  );
}
