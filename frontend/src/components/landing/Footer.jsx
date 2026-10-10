import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import Logo from "../ui/Logo";

export const AUTHOR = {
  name: "Kadambari Yewale",
  github: "https://github.com/kads9905",
  email: "kadambari9905@gmail.com",
};

// lucide dropped brand marks, so the GitHub logo is inlined
function GitHubIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

const COLUMNS = [
  {
    title: "Product",
    links: [
      ["How it works", "/#how"],
      ["Formats", "/#formats"],
      ["FAQ", "/#faq"],
    ],
  },
  {
    title: "Account",
    links: [
      ["Log in", "/login"],
      ["Sign up", "/register"],
      ["Studio", "/app"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy policy", "/privacy"],
      ["Terms of service", "/terms"],
    ],
  },
];

const iconLink =
  "squish grid size-10 place-items-center rounded-full border border-line-strong bg-surface text-ink-muted hover:border-ink hover:text-ink";

export default function Footer() {
  return (
    <footer className="bg-paper">
      <div className="mx-auto grid max-w-[1240px] gap-10 border-t border-line px-5 py-14 sm:px-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">Squish your files. Not your pixels.</p>
          <div className="mt-6 flex gap-2">
            <a href={AUTHOR.github} target="_blank" rel="noreferrer" className={iconLink} aria-label="Squish on GitHub" title="GitHub">
              <GitHubIcon className="size-[18px]" />
            </a>
            <a href={`mailto:${AUTHOR.email}`} className={iconLink} aria-label={`Email ${AUTHOR.name}`} title="Email">
              <Mail className="size-[18px]" />
            </a>
          </div>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  {href.startsWith("/#") ? (
                    <a href={href} className="text-sm text-ink-muted transition hover:text-ink">
                      {label}
                    </a>
                  ) : (
                    <Link to={href} className="text-sm text-ink-muted transition hover:text-ink">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-2 px-5 pb-10 text-xs text-ink-subtle sm:flex-row sm:px-8">
        <p>
          © {new Date().getFullYear()} Squish · Made by{" "}
          <a href={AUTHOR.github} target="_blank" rel="noreferrer" className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4">
            {AUTHOR.name}
          </a>
        </p>
        <p>Powered by sharp and FFmpeg</p>
      </div>
    </footer>
  );
}
