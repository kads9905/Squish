import { ArrowLeft, Check } from "lucide-react";
import { Link } from "react-router-dom";
import Logo, { Blob } from "../ui/Logo";
import SquishWord from "../ui/SquishWord";
import ThemeToggle from "../ui/ThemeToggle";

const PERKS = ["WebP, AVIF, JPEG, PNG and MP4", "Before/after compare on every file", "Delete anything, any time"];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh bg-surface lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-ink">
              <ArrowLeft className="size-4" /> Home
            </Link>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="display animate-fade-up text-[40px] leading-[1.02]">{title}</h1>
          <p className="mt-2 animate-fade-up text-[15px] text-ink-muted [animation-delay:60ms]">{subtitle}</p>
          <div className="mt-8 animate-fade-up [animation-delay:120ms]">{children}</div>
          {footer && <p className="mt-8 text-center text-sm text-ink-muted">{footer}</p>}
        </div>
      </div>

      <aside className="m-3 hidden flex-col justify-between rounded-[36px] bg-accent p-12 lg:flex">
        <span className="inline-block origin-bottom animate-[squish-bounce_1.8s_var(--ease-squish)_infinite] self-start">
          <Blob size={48} highlight="#ffffff" />
        </span>
        <div>
          <p className="display text-[clamp(48px,5vw,80px)] leading-[0.98]">
            <SquishWord quality={45} origin="left" /> your files.
            <br />
            <span className="text-ink/45">Not your pixels.</span>
          </p>
          <ul className="mt-10 space-y-3">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-[15px] font-medium">
                <span className="grid size-6 place-items-center rounded-full bg-fill text-accent">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
