import { proficiencyBonus, proficiencyRankAtLevel } from "@/lib/shim-sham/proficiency";

/** Trained at 1; Swashbuckler Expertise at 9. https://2e.aonprd.com/Classes.aspx?ID=63 */
const CLASS_DC_RANKS = [
  { level: 1, rank: "T" },
  { level: 9, rank: "E" },
] as const;

/**
 * Class DC = 10 + class DC proficiency bonus + key attribute modifier.
 * Swashbuckler key attribute is Dexterity.
 * @see https://2e.aonsrd.com/rules/89-class-dc
 */
export function classDc(keyAttributeModifier: number, level: number): number {
  const rank = proficiencyRankAtLevel(CLASS_DC_RANKS, level);
  return 10 + proficiencyBonus(rank, level) + keyAttributeModifier;
}
