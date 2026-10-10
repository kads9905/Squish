import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "../ui/Logo";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/cn";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#formats", label: "Formats" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        scrolled || open ? "border-b border-line bg-surface/90 backdrop-blur-md" : "border-b border-transparent bg-surface"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-10">
          <Logo />
          <ul className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="relative text-sm font-medium text-ink-muted transition hover:text-ink after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform after:duration-300 after:ease-[var(--ease-out)] hover:after:scale-x-100"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <Button to="/app" size="sm">
              Open studio
            </Button>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button to="/register" size="sm">
                Sign up
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
        <button
          className="squish grid size-10 place-items-center rounded-full hover:bg-soft"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        </div>
      </nav>

      {open && (
        <div className="animate-fade-up border-t border-line px-5 pt-3 pb-5 md:hidden">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-3 py-3 font-medium hover:bg-soft">
              {l.label}
            </a>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {user ? (
              <Button to="/app" className="col-span-2">
                Open studio
              </Button>
            ) : (
              <>
                <Button to="/login" variant="secondary">
                  Log in
                </Button>
                <Button to="/register">Sign up</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
