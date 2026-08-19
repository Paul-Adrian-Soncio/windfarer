import { cn } from "@/lib/cn";

/**
 * The paper-airplane badge — same gradient/mark used in the header
 * (components/layout/AppHeader.tsx) and app/icon.svg, pulled out here so
 * every other spot that wants "the logo" (like the sign-in screen) draws
 * from one definition instead of a copy-pasted SVG path.
 */
export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center rounded-xl", className)}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(150deg, #3f8f6f, #1f4b3a)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.28), 0 4px 10px -4px rgba(0,0,0,.4)",
      }}
    >
      <svg viewBox="0 0 24 24" className="h-[52.5%] w-[52.5%] -rotate-[8deg] fill-white">
        <path d="M2 21l21-9L2 3v7l15 2-15 2v5z" />
      </svg>
    </span>
  );
}
