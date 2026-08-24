/** Full Stylish Combatant status bonus to Speeds (includes Vivacious Speed at 3+). */
export function stylishSpeedBonusFull(level: number): number {
  if (level >= 19) return 30;
  if (level >= 15) return 25;
  if (level >= 11) return 20;
  if (level >= 7) return 15;
  if (level >= 3) return 10;
  return 5;
}

/** Half the full bonus, rounded down to the nearest 5-foot increment. */
export function stylishSpeedBonusWithoutPanache(level: number): number {
  if (level < 3) return 0;
  const half = stylishSpeedBonusFull(level) / 2;
  return Math.floor(half / 5) * 5;
}

export function stylishSpeedBonus(level: number, panache: boolean): number {
  return panache ? stylishSpeedBonusFull(level) : stylishSpeedBonusWithoutPanache(level);
}
