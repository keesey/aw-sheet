import { proficiencyBonus, proficiencyRankAtLevel } from "@/lib/shim-sham/proficiency";

/** Expert at 1; Perception Mastery at 11. https://2e.aonprd.com/Classes.aspx?ID=63 */
const PERCEPTION_RANKS = [
  { level: 1, rank: "E" },
  { level: 11, rank: "M" },
] as const;

/**
 * Perception modifier = Wisdom modifier + proficiency bonus.
 * Other bonuses and penalties are currently 0.
 * @see https://2e.aonsrd.com/rules/346-perception
 */
export function perception(wisModifier: number, level: number): number {
  const rank = proficiencyRankAtLevel(PERCEPTION_RANKS, level);
  return wisModifier + proficiencyBonus(rank, level);
}
