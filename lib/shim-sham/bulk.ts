/** Bulk units: 10 L (light) = 1 bulk. Negligible (—) = 0. */
import type { ActiveCondition, AdHocInventoryItem } from "@/lib/types";

/** Normalize user bulk input per AoN rules (number, L, or —). */
export function normalizeBulkValue(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed === "—" || trimmed === "-") return "—";
  if (trimmed.toUpperCase() === "L") return "L";
  const n = Number.parseFloat(trimmed);
  if (!Number.isNaN(n) && n >= 0) {
    return Number.isInteger(n) ? String(n) : String(n);
  }
  return null;
}

export function bulkSelectOptions(maxBulk: number): { value: string; label: string }[] {
  const numeric = Array.from({ length: Math.max(0, maxBulk) }, (_, index) => {
    const value = String(index + 1);
    return { value, label: value };
  });
  return [
    { value: "—", label: "—" },
    { value: "L", label: "L" },
    ...numeric,
  ];
}

export function normalizeAdHocItems(items: AdHocInventoryItem[] | undefined): AdHocInventoryItem[] {
  if (!items?.length) return [];
  return items
    .map((item) => {
      const name = item.name.trim();
      const bulk = normalizeBulkValue(item.bulk) ?? "—";
      const url = item.url?.trim();
      return {
        id: item.id,
        name,
        bulk,
        ...(url ? { url } : {}),
      };
    })
    .filter((item) => item.name.length > 0);
}

export function bulkToUnits(bulk: string): number {
  const trimmed = bulk.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") return 0;
  if (trimmed.toUpperCase() === "L") return 0.1;
  const n = Number.parseFloat(trimmed);
  return Number.isNaN(n) ? 0 : n;
}

export function totalBulk(items: { bulk: string }[]): number {
  const sum = items.reduce((total, item) => total + bulkToUnits(item.bulk), 0);
  return Math.floor(sum);
}

export function maxBulkCapacity(strModifier: number): number {
  return 10 + strModifier;
}

/** Whole bulk units, rounded down (e.g. 3.7 → "3"). */
export function formatBulkUnits(units: number): string {
  return String(Math.floor(units));
}

export function formatBulkLabel(bulk: string): string {
  const trimmed = bulk.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") return "—";
  return trimmed;
}

/** Bulk at which Encumbered applies (AoN 2e: 5 + STR modifier). */
export function encumberedBulkThreshold(strModifier: number): number {
  return 5 + strModifier;
}

export function isEncumberedByBulk(bulkUnits: number, strModifier: number): boolean {
  return bulkUnits >= encumberedBulkThreshold(strModifier);
}

export function isOverburdenedByBulk(bulkUnits: number, strModifier: number): boolean {
  return bulkUnits > maxBulkCapacity(strModifier);
}

export function syncEncumberedFromBulk(
  conditions: ActiveCondition[],
  bulkUnits: number,
  strModifier: number,
): ActiveCondition[] {
  const required = isEncumberedByBulk(bulkUnits, strModifier);
  const hasEncumbered = conditions.some((c) => c.id === "encumbered");

  if (required && !hasEncumbered) {
    return [...conditions, { id: "encumbered" }];
  }
  if (!required && hasEncumbered) {
    return conditions.filter((c) => c.id !== "encumbered");
  }
  return conditions;
}

/** Green at 0 bulk → red at encumbered threshold (5 + STR). Over max turns fully red. */
export function bulkBarColor(
  bulkUnits: number,
  strModifier: number,
): string {
  const max = maxBulkCapacity(strModifier);
  if (bulkUnits > max) return "hsl(0, 65%, 42%)";
  const threshold = encumberedBulkThreshold(strModifier);
  const ratio = threshold > 0 ? Math.min(1, bulkUnits / threshold) : 1;
  const hue = Math.round(142 * (1 - ratio));
  return `hsl(${hue}, 65%, 42%)`;
}
