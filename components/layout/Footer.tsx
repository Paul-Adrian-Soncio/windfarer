import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const DASHBOARD_LINKS = [
  { href: "/", label: "Home" },
  { href: "/planner", label: "Planner" },
  { href: "/itinerary", label: "Itinerary" },
  { href: "/budget", label: "Budget" },
];

// The welcome page is reachable while signed out — the dashboard tabs
// above are all auth-gated (see components/layout/AuthGate.tsx) and would
// just bounce a logged-out visitor straight back to /welcome, so this
// context gets its own, publicly-meaningful set instead.
const WELCOME_LINKS = [
  { href: "/welcome", label: "About" },
  { href: "/sign-in", label: "Sign in" },
];

interface FooterProps {
  variant?: "dashboard" | "welcome";
}

/**
 * Shared between the welcome page and every dashboard tab — the one place
 * excluded is /sign-in, which stays a focused, single-purpose screen with
 * nothing below the fold to scroll past. Rendered directly by whichever
 * page/layout wants it (app/welcome/page.tsx, app/(tabs)/layout.tsx)
 * rather than the root layout, so sign-in simply never imports it instead
 * of needing a route-based exclusion check.
 */
export function Footer({ variant = "dashboard" }: FooterProps) {
  const links = variant === "welcome" ? WELCOME_LINKS : DASHBOARD_LINKS;

  return (
    <footer className="border-t border-hair bg-surface">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-2.5">
          <Logo size={26} />
          <div className="text-center sm:text-left">
            <p className="font-display text-[13.5px] font-bold text-ink-900">WindFarer</p>
            <p className="mt-0.5 max-w-[220px] text-[12px] leading-relaxed text-ink-500">
              Your journey, planned with a friend.
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12px] text-ink-500">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-primary-700">
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-hair py-3 text-center text-[11px] text-ink-500">
        &copy; {new Date().getFullYear()} WindFarer. Made for wanderers.
      </div>
    </footer>
  );
}
