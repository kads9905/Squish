import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import ThemeToggle from "../components/ui/ThemeToggle";
import Footer, { AUTHOR } from "../components/landing/Footer";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/cn";

const UPDATED = "October 2026";

/* Content describes how this app actually works: files are processed on the Squish server
   (sharp / FFmpeg), stored per account, and deletable at any time. */
const DOCS = {
  privacy: {
    title: "Privacy Policy",
    meta: ["4 min read", "Server-side processing"],
    summary:
      "Squish compresses your images and videos on our server. Files you upload are stored privately in your account so you can compare and download them, and you can delete them — or your whole account — at any time. We don't sell your data or use your files for anything other than squishing them.",
    sections: [
      {
        title: "What we collect",
        body: [
          "When you create an account we store your full name, username, email address and a hashed version of your password (we never store it in plain text).",
          "When you upload a file we store the original, the compressed output, and details about it: file name, type, size, dimensions and the settings you chose.",
        ],
      },
      {
        title: "How your files are processed",
        body: [
          "Images are compressed with sharp and videos with FFmpeg, on the Squish server. Your files are not sent to any third-party processing service.",
          "Image metadata such as EXIF (which can include camera details and location) is stripped from compressed outputs.",
        ],
      },
      {
        title: "Who can see your files",
        body: [
          "Files are tied to your account and only served to you while you're signed in. We don't share, sell or publish them, and we don't use them to train models.",
        ],
      },
      {
        title: "Cookies",
        body: [
          "We use two essential, HTTP-only cookies to keep you signed in: an access token and a refresh token. We don't use advertising or tracking cookies.",
          "Your browser may also remember small preferences locally; these never leave your device.",
        ],
      },
      {
        title: "Retention and deletion",
        body: [
          "Your files stay in your library until you delete them. You can delete a single file, a selection, or clear your whole library from the Library and Settings pages — this removes both the original and the compressed copy from our storage.",
          "Deleting your account from Settings removes your profile and every file associated with it.",
        ],
      },
      {
        title: "Contact",
        body: [`Questions about your data? Email ${AUTHOR.email} and we'll get back to you.`],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    meta: ["3 min read", "Plain-language terms"],
    summary:
      "Squish is a free tool for compressing your own images and videos. Use it for files you have the right to use, don't abuse the service, and remember it's provided as-is. You keep ownership of everything you upload.",
    sections: [
      {
        title: "Using Squish",
        body: [
          "You need an account to upload and compress files. You're responsible for keeping your login details safe and for activity on your account.",
        ],
      },
      {
        title: "Your content",
        body: [
          "You keep all rights to the files you upload. You give Squish only the permission it needs to store, process and serve those files back to you.",
          "Only upload files you own or have permission to use.",
        ],
      },
      {
        title: "Acceptable use",
        body: [
          "Don't upload anything illegal, harmful or infringing, don't try to break, overload or reverse-engineer the service, and don't use automated tools to abuse it. Uploads are limited to 500 MB per file.",
        ],
      },
      {
        title: "Availability",
        body: [
          "Squish is provided as-is and as-available, without warranties. Keep your own copies of important originals — we can't guarantee files will always be available.",
        ],
      },
      {
        title: "Ending your account",
        body: [
          "You can delete your account at any time from Settings. We may suspend accounts that break these terms.",
        ],
      },
      {
        title: "Changes",
        body: [
          `We may update these terms; the date at the top shows the latest version. Questions? Email ${AUTHOR.email}.`,
        ],
      },
    ],
  },
};

export default function Legal() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const doc = DOCS[pathname === "/terms" ? "terms" : "privacy"];

  useEffect(() => {
    document.title = `${doc.title} · Squish`;
    window.scrollTo(0, 0);
  }, [doc.title]);

  const tab = ({ isActive }) =>
    cn("squish rounded-full px-4 py-1.5 text-sm font-semibold", isActive ? "bg-surface text-ink shadow-[var(--shadow-card)]" : "text-ink-muted hover:text-ink");

  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="hidden items-center gap-1 text-sm font-medium text-ink-muted transition hover:text-ink sm:inline-flex">
              <ChevronLeft className="size-4" /> Home
            </Link>
            <span className="hidden h-5 w-px rotate-12 bg-line-strong sm:block" />
            <Logo />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <nav className="flex gap-1 rounded-full bg-soft p-1" aria-label="Legal documents">
              <NavLink to="/privacy" className={tab}>
                Privacy
              </NavLink>
              <NavLink to="/terms" className={tab}>
                Terms
              </NavLink>
            </nav>
            <Button to={user ? "/app" : "/register"} size="sm" className="hidden sm:inline-flex">
              {user ? "Open studio" : "Open app"}
            </Button>
          </div>
        </div>
      </header>

      <main key={pathname} className="mx-auto max-w-3xl animate-fade-up px-5 pt-16 pb-24 sm:px-8 sm:pt-24">
        <h1 className="display text-[clamp(44px,7vw,76px)] leading-none">{doc.title}</h1>
        <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-subtle">
          <span>Last updated: {UPDATED}</span>
          {doc.meta.map((m) => (
            <span key={m} className="flex items-center gap-3">
              <span className="size-1 rounded-full bg-ink-faint" />
              {m}
            </span>
          ))}
        </p>

        <div className="mt-8 border-t border-line pt-8">
          <p className="rounded-[var(--radius-inner)] bg-accent-soft px-6 py-5 text-[15px] leading-relaxed text-ink">{doc.summary}</p>
        </div>

        <div className="mt-6 divide-y divide-line">
          {doc.sections.map((s, i) => (
            <section key={s.title} className="py-10">
              <h2 className="flex items-baseline gap-3 font-display text-2xl font-bold tracking-[-0.03em]">
                <span className="font-mono text-sm font-medium text-ink-subtle">{String(i + 1).padStart(2, "0")}.</span>
                {s.title}
              </h2>
              {s.body.map((para) => (
                <p key={para} className="mt-4 text-[17px] leading-[1.75] text-ink-muted">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
