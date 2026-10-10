import { Blob } from "./Logo";

export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-5 grid size-16 place-items-center rounded-full bg-accent-soft">
        <Blob size={30} />
      </div>
      <h3 className="font-display text-xl font-bold tracking-[-0.03em]">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
