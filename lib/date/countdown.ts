export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
  isToday: boolean;
}

export function getCountdown(departureDate: string, departureTime?: string, now: Date = new Date()): Countdown {
  const target = new Date(`${departureDate}T${departureTime ?? "00:00"}:00`);
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
