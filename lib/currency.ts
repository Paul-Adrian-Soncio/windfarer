export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
}

// A curated set of common trip currencies rather than the full ISO 4217 list —
// keeps the selector scannable. Add more as needed.
export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "PHP", label: "Philippine Peso", symbol: "₱" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", label: "Hong Kong Dollar", symbol: "HK$" },
  { code: "KRW", label: "South Korean Won", symbol: "₩" },
  { code: "CNY", label: "Chinese Yuan", symbol: "¥" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "THB", label: "Thai Baht", symbol: "฿" },
  { code: "IDR", label: "Indonesian Rupiah", symbol: "Rp" },
  { code: "VND", label: "Vietnamese Dong", symbol: "₫" },
  { code: "MXN", label: "Mexican Peso", symbol: "MX$" },
  { code: "NZD", label: "New Zealand Dollar", symbol: "NZ$" },
  { code: "CHF", label: "Swiss Franc", symbol: "CHF" },
];

export const DEFAULT_CURRENCY = "USD";

export function getCurrencyOption(code: string): CurrencyOption {
  return CURRENCY_OPTIONS.find((c) => c.code === code) ?? CURRENCY_OPTIONS[0];
}
