import type { AbilityKey, ProficiencyRank } from "@/lib/types";
import { getWornArmor } from "@/lib/shim-sham/armor";
import { proficiencyBonus, proficiencyRankAtLevel } from "@/lib/shim-sham/proficiency";

type SaveId = "fort" | "reflex" | "will";

const SAVE_ABILITY: Record<SaveId, AbilityKey> = {
  fort: "CON",
  reflex: "DEX",
  will: "WIS",
};

/**
 * Swashbuckler save ranks from https://2e.aonprd.com/Classes.aspx?ID=63
 * Fortitude Expertise 3, Confident Evasion (Reflex master) 7,
 * Assured Evasion (Reflex legendary) 13. Will stays expert through 15.
 */
const SAVE_RANKS: Record<SaveId, ReadonlyArray<{ level: number; rank: ProficiencyRank }>> = {
  fort: [
    { level: 1, rank: "T" },
    { level: 3, rank: "E" },
  ],
  reflex: [
    { level: 1, rank: "E" },
    { level: 7, rank: "M" },
    { level: 13, rank: "L" },
  ],
  will: [{ level: 1, rank: "E" }],
};

function saveModifier(abilityModifier: number, save: SaveId, level: number): number {
  const rank = proficiencyRankAtLevel(SAVE_RANKS[save], level);
  const resilient = getWornArmor(level).resilient;
  return abilityModifier + proficiencyBonus(rank, level) + resilient;
}

/**
 * Saving throw modifiers = key attribute + proficiency bonus + other bonuses.
 * The only other bonus currently is armor's Resilient item bonus.
 * @see https://2e.aonsrd.com/rules/344-saving-throws
 * @see https://2e.aonsrd.com/traits/155-resilient
 */
export function savingThrows(
  abilities: Record<AbilityKey, number>,
  level: number,
): Record<SaveId, number> {
  return {
    fort: saveModifier(abilities[SAVE_ABILITY.fort], "fort", level),
    reflex: saveModifier(abilities[SAVE_ABILITY.reflex], "reflex", level),
    will: saveModifier(abilities[SAVE_ABILITY.will], "will", level),
  };
}
