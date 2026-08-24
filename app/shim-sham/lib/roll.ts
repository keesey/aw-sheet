export type RollResult = {
  label: string;
  d20: number;
  bonus: number;
  total: number;
};

export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export function rollCheck(label: string, bonus: number): RollResult {
  const d20 = rollD20();
  return { label, d20, bonus, total: d20 + bonus };
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
