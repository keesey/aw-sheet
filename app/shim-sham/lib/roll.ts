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
