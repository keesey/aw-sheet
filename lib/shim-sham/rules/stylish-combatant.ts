/**
 * Circumstance bonus on bravado skill checks from Stylish Combatant.
 * Swashbuckler Expertise increases it to +2 at level 9.
 * @see https://2e.aonprd.com/Classes.aspx?ID=63
 */
export function stylishCombatantBonus(level: number): number {
  return level >= 9 ? 2 : 1;
}

export function formatStylishCombatantBonus(level: number): string {
  const bonus = stylishCombatantBonus(level);
  return bonus >= 0 ? `+${bonus}` : `${bonus}`;
}

/** In combat, or in exploration at 11+ (Continuous Flair). */
export function stylishCombatantApplies(inEncounter: boolean, level: number): boolean {
  return inEncounter || level >= 11;
}
