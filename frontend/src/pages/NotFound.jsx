import { ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";
import Logo, { Blob } from "../components/ui/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface px-5 py-6 sm:px-8">
      <Logo />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {/* a ball that's been squished completely flat */}
        <div style={{ transform: "scale(1.9, 0.45)", transformOrigin: "50% 100%" }}>
          <Blob size={72} />
        </div>
        <p className="eyebrow mt-12">Error 404</p>
        <h1 className="display mt-3 text-[clamp(44px,7vw,88px)] leading-none">Squished flat.</h1>
        <p className="mx-auto mt-4 max-w-sm text-[17px] text-ink-muted">This page doesn't exist — or it got squished a little too hard.</p>
        <Button to="/" size="lg" className="mt-9">
          <ArrowLeft className="size-4" /> Back home
        </Button>
      </div>
    </div>
  );
}
