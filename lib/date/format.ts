/**
 * Formats a date string for display. Accepts either a plain "YYYY-MM-DD"
 * or a full ISO datetime string (the shape Prisma DateTime fields
 * serialize to, e.g. "2026-08-21T00:00:00.000Z") — same defensive
 * approach as lib/date/countdown.ts, so a raw ISO string never leaks
 * straight into the UI un-formatted.
 */
export function formatShortDate(date: string): string {
  const datePart = date.slice(0, 10);
  const parsed = new Date(`${datePart}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
