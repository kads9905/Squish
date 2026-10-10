import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutGrid, PanelLeftClose, PanelLeftOpen, Settings2, Shrink } from "lucide-react";
import Logo, { Blob } from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../lib/cn";
import ProfileMenu from "./ProfileMenu";
export { Avatar } from "./ProfileMenu";

const NAV = [
  { to: "/app", label: "Studio", icon: Shrink, end: true },
  { to: "/app/library", label: "Library", icon: LayoutGrid },
  { to: "/app/settings", label: "Settings", icon: Settings2 },
];

const COLLAPSE_KEY = "squish-sidebar-collapsed";
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
};

export default function AppLayout() {
  const { logout } = useAuth();
  const toast = useToast();
  const { pathname } = useLocation();
  // desktop sidebar can shrink to an icon rail; the choice is remembered
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {
        /* storage unavailable — just won't persist */
      }
      return !c;
    });

  const onLogout = async () => {
    await logout(); // lands on the home page
    toast.bye("Logged out. See you soon.");
  };

  return (
    <div
      className={cn(
        "min-h-dvh bg-paper transition-[padding] duration-300 ease-[var(--ease-out)]",
        collapsed ? "lg:pl-[84px]" : "lg:pl-[264px]"
      )}
    >
      {/* desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-surface py-5 transition-[width,padding] duration-300 ease-[var(--ease-out)] lg:flex",
          collapsed ? "w-[84px] px-3" : "w-[264px] px-5"
        )}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <NavLink to="/app" aria-label="Squish home" className="grid size-10 place-items-center">
              <Blob size={26} />
            </NavLink>
            <button
              onClick={toggleCollapsed}
              className="squish grid size-9 place-items-center rounded-full text-ink-muted hover:bg-soft hover:text-ink"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="size-[18px]" />
            </button>
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex items-center justify-between py-1 pl-2">
            <Logo to="/app" />
            <div className="flex items-center">
              <ThemeToggle />
              <button
                onClick={toggleCollapsed}
                className="squish grid size-9 place-items-center rounded-full text-ink-muted hover:bg-soft hover:text-ink"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="size-[18px]" />
              </button>
            </div>
          </div>
        )}

        <nav className={cn("space-y-1", collapsed ? "mt-6" : "mt-10")} aria-label="Main">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "squish flex items-center rounded-full text-[15px] font-semibold",
                  collapsed ? "mx-auto size-11 justify-center" : "gap-3 px-4 py-2.5",
                  isActive ? "bg-fill text-on-fill" : "text-ink-muted hover:bg-soft hover:text-ink"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("size-[18px] shrink-0", isActive && "text-accent dark:text-on-fill")} />
                  {!collapsed && label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={cn("mt-auto", collapsed && "flex justify-center")}>
          <ProfileMenu onLogout={onLogout} compact={collapsed} placement={collapsed ? "right" : "up"} />
        </div>
      </aside>

      {/* mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface/90 px-5 backdrop-blur-md lg:hidden">
        <Logo to="/app" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ProfileMenu onLogout={onLogout} placement="down" compact />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] px-5 pt-8 pb-32 sm:px-8 lg:px-12 lg:pt-12 lg:pb-16">
        {/* re-keyed per route so each page eases in */}
        <div key={pathname} className="animate-fade-up">
          <Outlet />
        </div>
      </main>

      {/* mobile bottom tabs */}
      <nav
        aria-label="Main"
        className="fixed inset-x-4 bottom-4 z-30 grid grid-cols-3 gap-1 rounded-full border border-line bg-surface p-1.5 shadow-[var(--shadow-pop)] lg:hidden"
      >
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "squish flex items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-semibold",
                isActive ? "bg-fill text-on-fill" : "text-ink-muted"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("size-4", isActive && "text-accent dark:text-on-fill")} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display text-[40px] leading-none sm:text-[48px]">{title}</h1>
        {description && <p className="mt-3 text-[15px] text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
