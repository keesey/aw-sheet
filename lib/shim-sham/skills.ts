import type { AbilityKey, LevelSnapshot, ProficiencyRank, SkillEntry } from "@/lib/types";
import { proficiencyBonus, proficiencyRankAtLevel } from "@/lib/shim-sham/proficiency";

const AON = "https://2e.aonsrd.com";

type SkillDefinition = {
  name: string;
  keyAbility: AbilityKey;
  url: string;
  /**
   * Proficiency rank from this character level onward, until a later entry.
   * Omitted levels stay at the previous rank (default untrained).
   */
  ranks: ReadonlyArray<{ level: number; rank: ProficiencyRank }>;
};

/**
 * Shim Sham's trained skills and rank increases, from
 * https://gist.github.com/keesey/7ae2c20287b0555a44d3f910eecb4530
 *
 * Key attributes: https://2e.aonsrd.com/skills
 */
const SHIM_SHAM_SKILLS: readonly SkillDefinition[] = [
  {
    name: "Acrobatics",
    keyAbility: "DEX",
    url: `${AON}/skills/1-acrobatics`,
    ranks: [
      { level: 1, rank: "T" },
      { level: 3, rank: "E" },
      { level: 7, rank: "M" },
      { level: 15, rank: "L" },
    ],
  },
  {
    name: "Athletics",
    keyAbility: "STR",
    url: `${AON}/skills/3-athletics`,
    ranks: [
      { level: 5, rank: "T" },
      { level: 13, rank: "E" },
    ],
  },
  {
    name: "Diplomacy",
    keyAbility: "CHA",
    url: `${AON}/skills/7-diplomacy`,
    ranks: [{ level: 1, rank: "T" }],
  },
  {
    name: "Intimidation",
    keyAbility: "CHA",
    url: `${AON}/skills/8-intimidation`,
    ranks: [
      { level: 1, rank: "T" },
      { level: 9, rank: "E" },
    ],
  },
  {
    name: "Lore (Piracy)",
    keyAbility: "INT",
    url: `${AON}/skills/9-lore`,
    ranks: [{ level: 1, rank: "T" }],
  },
  {
    name: "Performance",
    keyAbility: "CHA",
    url: `${AON}/skills/13-performance`,
    ranks: [
      { level: 1, rank: "T" },
      { level: 3, rank: "E" },
      { level: 7, rank: "M" },
      { level: 15, rank: "L" },
    ],
  },
  {
    name: "Piloting",
    keyAbility: "DEX",
    url: `${AON}/skills/14-piloting`,
    ranks: [{ level: 1, rank: "T" }],
  },
  {
    name: "Stealth",
    keyAbility: "DEX",
    url: `${AON}/skills/17-stealth`,
    ranks: [{ level: 1, rank: "T" }],
  },
  {
    name: "Thievery",
    keyAbility: "DEX",
    url: `${AON}/skills/19-thievery`,
    ranks: [
      { level: 1, rank: "T" },
      { level: 11, rank: "E" },
    ],
  },
];

/**
 * Skill check modifier = key attribute modifier + proficiency bonus.
 * Other bonuses and penalties are currently 0 for every skill.
 * @see https://2e.aonsrd.com/rules/348-skill-checks
 */
export function skillCheckBonus(
  keyAttributeModifier: number,
  rank: ProficiencyRank,
  level: number,
): number {
  return keyAttributeModifier + proficiencyBonus(rank, level);
}

export function buildSkillEntries(snapshot: LevelSnapshot): SkillEntry[] {
  return SHIM_SHAM_SKILLS.map((skill) => {
    const proficiency = proficiencyRankAtLevel(skill.ranks, snapshot.level);
    return {
      name: skill.name,
      proficiency,
      url: skill.url,
      bonus: skillCheckBonus(snapshot.abilities[skill.keyAbility], proficiency, snapshot.level),
    };
  });
}

export function skillBonusByName(skills: SkillEntry[], name: string): number {
  const skill = skills.find((entry) => entry.name === name);
  if (!skill) {
    throw new Error(`Unknown skill: ${name}`);
  }
  return skill.bonus;
}

export function formatSignedBonus(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
