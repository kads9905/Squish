import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Blob } from "../components/ui/Logo";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { cn } from "../lib/cn";

const DURATION = 2800; // ms on screen before the studio appears
const LINES = ["Fluffing the pixels…", "Warming up the encoders…", "Clearing a spot on the shelf…"];

/**
 * Short interstitial between logging in and the studio: the ball drops in and
 * squashes, a lime bar fills, then the page eases out. Publishes the user to the
 * auth context and pre-warms the studio's data while it plays.
 */
export default function Welcome() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user: current, setUser, loading } = useAuth();
  const user = state?.user ?? current;
  const [leaving, setLeaving] = useState(false);
  const [line] = useState(() => LINES[Math.floor(Math.random() * LINES.length)]);

  useEffect(() => {
    if (!user) return;
    if (state?.user) setUser(state.user);
    // pre-warm what the studio shows first
    api.history({ limit: 4 }).catch(() => {});

    // dev aid: /welcome?hold keeps the screen up for design tweaks (ignored in production builds)
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("hold")) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduced ? 400 : DURATION;
    const out = setTimeout(() => setLeaving(true), total - 300);
    const go = setTimeout(() => navigate(state?.from || "/app", { replace: true }), total);
    return () => {
      clearTimeout(out);
      clearTimeout(go);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(user)]);

  // opened directly / refreshed: wait for the session check before deciding
  if (!user && loading) return <div className="min-h-dvh bg-paper" />;
  if (!user) return <Navigate to="/login" replace />;

  const firstName = user.fullName?.split(" ")[0] || user.username;

  return (
    <div
      className={cn(
        "grid min-h-dvh place-items-center bg-paper px-6 transition-all duration-300 ease-[var(--ease-out)]",
        leaving && "scale-[0.98] opacity-0"
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center">
        {/* ball drops, squashes on landing, then keeps a gentle bounce */}
        <div className="relative h-24">
          <span className="block origin-bottom animate-[ball-drop_0.9s_var(--ease-out)_both]">
            <span className="block origin-bottom animate-[squish-bounce_1.1s_var(--ease-squish)_0.9s_infinite]">
              <Blob size={72} />
            </span>
          </span>
          {/* shadow that tightens as the ball lands */}
          <span className="absolute -bottom-2 left-1/2 h-2 w-16 -translate-x-1/2 animate-[fade-in_0.9s_ease-out_both] rounded-[50%] bg-ink/10" />
        </div>

        <h1 className="display mt-10 animate-fade-up text-[clamp(40px,6vw,64px)] leading-none [animation-delay:250ms]">
          Hey {firstName}.
        </h1>
        <p className="mt-3 animate-fade-up text-[15px] text-ink-muted [animation-delay:380ms]">{line}</p>

        <div className="mt-8 h-2 w-56 animate-fade-in overflow-hidden rounded-full bg-soft [animation-delay:300ms]">
          <div
            className="h-full rounded-full bg-accent"
            style={{ animation: `welcome-fill ${DURATION - 350}ms var(--ease-out) 150ms both` }}
          />
        </div>
      </div>
      <style>{`@keyframes welcome-fill { from { width: 4% } to { width: 100% } }`}</style>
    </div>
  );
}
