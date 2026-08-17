/**
 * Prisma's Decimal fields (cost, amount, plannedExpense, totalBudget)
 * serialize to JSON as strings, not numbers — e.g. `"450.75"`, not
 * `450.75`. The frontend's types all want `number`. This converts one
 * value, treating null/undefined as "not set" (matching the optional
 * `cost?: number` style used throughout types/).
 */
export function decimalToNumber(value: string | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  return Number(value);
}
