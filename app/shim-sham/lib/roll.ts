import type { StrikeRollResult } from "./strike-roll";

export type DamageRollLine = {
  label: string;
  rolls: number[];
  modifier: number;
  subtotal: number;
  /** When set (>1), damage was multiplied on a critical hit (rolls are shown once). */
  critMultiplier?: number;
};

export type CheckRollResult = {
  kind: "check";
  label: string;
  d20: number;
  bonus: number;
  total: number;
};

export type RollResult = CheckRollResult | StrikeRollResult;

export function rollD(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollD20(): number {
  return rollD(20);
}

export function rollDiceNotation(notation: string): { rolls: number[]; total: number } {
  const match = notation.match(/^(\d+)d(\d+)$/);
  if (!match) {
    return { rolls: [], total: 0 };
  }
  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const rolls = Array.from({ length: count }, () => rollD(sides));
  return { rolls, total: rolls.reduce((sum, roll) => sum + roll, 0) };
}

export function rollCheck(label: string, bonus: number): CheckRollResult {
  const d20 = rollD20();
  return { kind: "check", label, d20, bonus, total: d20 + bonus };
}

function formatD20Breakdown(d20: number, bonus: number): string | null {
  if (bonus === 0) return null;
  const bonusText = bonus < 0 ? ` - ${Math.abs(bonus)}` : ` + ${bonus}`;
  return `${d20}${bonusText}`;
}

/** One-line summary for session notes. */
export function formatRollSummary(result: RollResult): string {
  if (result.kind === "check") {
    const breakdown = formatD20Breakdown(result.d20, result.bonus);
    return breakdown
      ? `${result.label}: ${result.total} (${breakdown})`
      : `${result.label}: ${result.total}`;
  }

  const mapSuffix = result.mapIndex > 0 ? ` (MAP ${result.mapIndex + 1})` : "";
  const outcome =
    result.isCrit ? ", crit" : result.isFumble ? ", fumble" : "";
  const breakdown = formatD20Breakdown(result.d20, result.bonus);
  const attack = breakdown
    ? `attack ${result.total} (${breakdown})`
    : `attack ${result.total}`;
  return `${result.label}${mapSuffix}: ${attack}, damage ${result.damageTotal}${outcome}`;
}

/** Parse the first numeric bonus from strings like "+12" or "+15/+10/+5". */
export function parseRollBonusString(bonus: string): number {
  const match = bonus.match(/([+-]?\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Parse a three-part MAP bonus string like "+15 / +10 / +5". */
export function parseMapAttackValues(bonus: string): [number, number, number] | null {
  if (!bonus.includes("/")) return null;
  const parts = bonus.split("/").map((part) => part.trim());
  if (parts.length !== 3) return null;
  const values = parts.map((part) => parseRollBonusString(part));
  return values.every((value) => !Number.isNaN(value)) ? values as [number, number, number] : null;
}
