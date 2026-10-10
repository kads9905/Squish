import { Blob } from "./Logo";

// A squishing ball instead of a generic spinner
export default function Spinner({ size = 28 }) {
  return (
    <span className="inline-block origin-bottom animate-[squish-bounce_0.9s_var(--ease-squish)_infinite]">
      <Blob size={size} />
    </span>
  );
}

export function FullPageSpinner() {
  return (
    <div className="grid min-h-dvh place-items-center bg-paper" aria-label="Loading">
      <Spinner size={36} />
    </div>
  );
}
