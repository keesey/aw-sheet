import type { ProficiencyRank } from "@/lib/types";
import { proficiencyBonus, proficiencyRankAtLevel } from "@/lib/shim-sham/rules/proficiency";

const AON = "https://2e.aonsrd.com";

type WornArmor = {
  name: string;
  url: string;
  /** Item bonus to AC from the armor. */
  acBonus: number;
  dexCap: number;
  /** Item bonus to saving throws from the Resilient trait. */
  resilient: number;
  notes?: string;
};

const SECOND_SKIN_COMMERCIAL: WornArmor = {
  name: "Second Skin (Commercial)",
  url: `${AON}/equipment/armor/10-second-skin`,
  acBonus: 1,
  dexCap: 4,
  resilient: 0,
};

const TEMPWEAVE_ADVANCED: WornArmor = {
  name: "Tempweave (Advanced)",
  url: `${AON}/equipment/armor/11-tempweave`,
  acBonus: 2,
  dexCap: 4,
  resilient: 1,
  notes: "Resilient +1, Jetpack, Force Field",
};

/** Worn armor from this character level onward. */
const ARMOR_BY_LEVEL: ReadonlyArray<{ level: number; armor: WornArmor }> = [
  { level: 1, armor: SECOND_SKIN_COMMERCIAL },
  { level: 3, armor: TEMPWEAVE_ADVANCED },
];

/** Light armor proficiency. Swashbucklers start trained; expertise at 13. */
const LIGHT_ARMOR_RANKS: ReadonlyArray<{ level: number; rank: ProficiencyRank }> = [
  { level: 1, rank: "T" },
  { level: 13, rank: "E" },
];

export function getWornArmor(level: number): WornArmor {
  let armor = SECOND_SKIN_COMMERCIAL;
  for (const step of ARMOR_BY_LEVEL) {
    if (level >= step.level) armor = step.armor;
  }
  return armor;
}

function lightArmorProficiency(level: number): ProficiencyRank {
  return proficiencyRankAtLevel(LIGHT_ARMOR_RANKS, level);
}

/**
 * Armor Class = 10 + Dex modifier (up to Dex Cap) + proficiency bonus
 * + armor's item bonus to AC. Other bonuses and penalties are currently 0
 * (Dueling Parry is applied separately at display time).
 * @see https://2e.aonsrd.com/rules/343-armor-class
 */
export function armorClass(dexModifier: number, level: number): number {
  const armor = getWornArmor(level);
  const dex = Math.min(dexModifier, armor.dexCap);
  const proficiency = proficiencyBonus(lightArmorProficiency(level), level);
  return 10 + dex + proficiency + armor.acBonus;
}
