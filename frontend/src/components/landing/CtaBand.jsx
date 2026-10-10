import { ArrowRight } from "lucide-react";
import Button from "../ui/Button";
import SquishWord from "../ui/SquishWord";
import { Blob } from "../ui/Logo";
import Reveal from "../ui/Reveal";
import { useAuth } from "../../context/AuthContext";

export default function CtaBand() {
  const { user } = useAuth();

  return (
    <section className="bg-paper px-5 pb-24 sm:px-8">
      <Reveal className="mx-auto flex max-w-[1240px] flex-col items-center rounded-[40px] bg-accent px-6 py-20 text-center sm:py-24">
        <span className="inline-block origin-bottom animate-[squish-bounce_1.6s_var(--ease-squish)_infinite]">
          <Blob size={56} highlight="#ffffff" />
        </span>
        <h2 className="display mt-8 text-[clamp(44px,7vw,104px)] leading-[0.95]">
          Ready to <SquishWord quality={40} origin="left">squish?</SquishWord>
        </h2>
        <p className="mt-5 max-w-md text-[17px] text-ink/70">Make a free account and squish your first file in under a minute.</p>
        <Button to={user ? "/app" : "/register"} size="lg" className="mt-9">
          {user ? "Open studio" : "Create free account"} <ArrowRight className="size-4" />
        </Button>
      </Reveal>
    </section>
  );
}
