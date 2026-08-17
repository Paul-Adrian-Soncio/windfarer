export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
  isToday: boolean;
}

export function getCountdown(departureDate: string, departureTime?: string, now: Date = new Date()): Countdown {
  // departureDate may arrive as either a plain "YYYY-MM-DD" or a full ISO
  // datetime string (the API's Trip.departureDate is the latter — Prisma
  // DateTime fields always serialize as full ISO strings, e.g.
  // "2026-08-22T00:00:00.000Z"). Take just the date portion so we can
  // safely combine it with departureTime, rather than assume one shape.
  const datePart = departureDate.slice(0, 10);
  const target = new Date(`${datePart}T${departureTime ?? "00:00"}:00`);
  const diffMs = target.getTime() - now.getTime();
  const isToday = target.toDateString() === now.toDateString();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, isPast: true, isToday };
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes, isPast: false, isToday };
}
