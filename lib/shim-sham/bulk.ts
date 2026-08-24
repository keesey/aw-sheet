/** Bulk units: 10 L (light) = 1 bulk. Negligible (—) = 0. */
import type { ActiveCondition } from "@/lib/types";

export function bulkToUnits(bulk: string): number {
  const trimmed = bulk.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") return 0;
  if (trimmed.toUpperCase() === "L") return 0.1;
  const n = Number.parseFloat(trimmed);
  return Number.isNaN(n) ? 0 : n;
}

export function totalBulk(items: { bulk: string }[]): number {
  return items.reduce((sum, item) => sum + bulkToUnits(item.bulk), 0);
}

export function maxBulkCapacity(strModifier: number): number {
  return 10 + strModifier;
}

/** e.g. 2.7 → "2.7", 2 → "2", 0.3 → "0.3" */
export function formatBulkUnits(units: number): string {
  const rounded = Math.round(units * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
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

/** Green at 0 bulk → red at encumbered threshold (5 + STR). */
export function bulkBarColor(bulkUnits: number, strModifier: number): string {
  const threshold = encumberedBulkThreshold(strModifier);
  const ratio = threshold > 0 ? Math.min(1, bulkUnits / threshold) : 1;
  const hue = Math.round(142 * (1 - ratio));
  return `hsl(${hue}, 65%, 42%)`;
}
