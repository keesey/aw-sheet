import type { ProficiencyRank } from "@/lib/types";

/** Rank bonus added to level when trained or better. Untrained is always +0. */
const RANK_BONUS: Record<Exclude<ProficiencyRank, "U">, number> = {
  T: 2,
  E: 4,
  M: 6,
  L: 8,
};

export type ProficiencyStep = { level: number; rank: ProficiencyRank };

/**
 * Highest rank whose `level` is at or below the character level.
 * Defaults to untrained if no step applies yet.
 */
export function proficiencyRankAtLevel(
  ranks: readonly ProficiencyStep[],
  level: number,
): ProficiencyRank {
  let rank: ProficiencyRank = "U";
  for (const step of ranks) {
    if (level >= step.level) rank = step.rank;
  }
  return rank;
}

/**
 * Proficiency bonus for a rank at a given character level.
 * @see https://2e.aonsrd.com/rules/36-proficiency
 */
export function proficiencyBonus(rank: ProficiencyRank, level: number): number {
  if (rank === "U") return 0;
  return level + RANK_BONUS[rank];
}
