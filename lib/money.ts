import { DEFAULT_CURRENCY } from "./currency";

export function fmtMoney(n: number, currency: string = DEFAULT_CURRENCY, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}
