import type { AttributeKey, LevelSnapshot, ProficiencyRank, SkillEntry } from "@/lib/types";
import { formatSigned } from "@/lib/format-signed";
import {
  proficiencyBonus,
  proficiencyRankAtLevel,
  proficiencyRankLabel,
} from "@/lib/shim-sham/rules/proficiency";
import { AON } from "@/lib/shim-sham/aon";
import { compareByName } from "@/lib/shim-sham/sort";

export type SkillProgressionChange = {
  name: string;
  url: string;
  rank: ProficiencyRank;
  label: string;
};

type SkillDefinition = {
  name: string;
  keyAttribute: AttributeKey;
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
    keyAttribute: "DEX",
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
    keyAttribute: "STR",
    url: `${AON}/skills/3-athletics`,
    ranks: [
      { level: 5, rank: "T" },
      { level: 13, rank: "E" },
    ],
  },
  {
    name: "Diplomacy",
    keyAttribute: "CHA",
    url: `${AON}/skills/7-diplomacy`,
    ranks: [{ level: 1, rank: "T" }],
  },
  {
    name: "Intimidation",
    keyAttribute: "CHA",
    url: `${AON}/skills/8-intimidation`,
    ranks: [
      { level: 1, rank: "T" },
      { level: 9, rank: "E" },
    ],
  },
  {
    name: "Lore (Piracy)",
    keyAttribute: "INT",
    url: `${AON}/skills/9-lore`,
    ranks: [{ level: 1, rank: "T" }],
  },
  {
    name: "Performance",
    keyAttribute: "CHA",
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
    keyAttribute: "DEX",
    url: `${AON}/skills/14-piloting`,
    ranks: [{ level: 1, rank: "T" }],
  },
  {
    name: "Stealth",
    keyAttribute: "DEX",
    url: `${AON}/skills/17-stealth`,
    ranks: [{ level: 1, rank: "T" }],
  },
  {
    name: "Thievery",
    keyAttribute: "DEX",
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
function skillCheckBonus(
  keyAttributeModifier: number,
  rank: ProficiencyRank,
  level: number,
): number {
  return keyAttributeModifier + proficiencyBonus(rank, level);
}

function rankBeforeLevel(
  ranks: ReadonlyArray<{ level: number; rank: ProficiencyRank }>,
  level: number,
): ProficiencyRank {
  let rank: ProficiencyRank = "U";
  for (const step of ranks) {
    if (step.level >= level) break;
    rank = step.rank;
  }
  return rank;
}

/** Skills whose proficiency rank changes at this character level. */
export function skillChangesAtLevel(level: number): SkillProgressionChange[] {
  return SHIM_SHAM_SKILLS.flatMap((skill) => {
    const step = skill.ranks.find((entry) => entry.level === level);
    if (!step) return [];
    const previous = rankBeforeLevel(skill.ranks, level);
    const nextLabel = proficiencyRankLabel(step.rank);
    const label =
      previous === "U" ? nextLabel : `${proficiencyRankLabel(previous)} → ${nextLabel}`;
    return [{ name: skill.name, url: skill.url, rank: step.rank, label }];
  }).sort(compareByName);
}

export function buildSkillEntries(snapshot: LevelSnapshot): SkillEntry[] {
  return SHIM_SHAM_SKILLS.map((skill) => {
    const proficiency = proficiencyRankAtLevel(skill.ranks, snapshot.level);
    return {
      name: skill.name,
      proficiency,
      url: skill.url,
      bonus: skillCheckBonus(snapshot.attributes[skill.keyAttribute], proficiency, snapshot.level),
    };
  });
}

export function getSkillKeyAttributes(): Record<string, AttributeKey> {
  return Object.fromEntries(SHIM_SHAM_SKILLS.map((skill) => [skill.name, skill.keyAttribute]));
}

export function skillBonusByName(skills: SkillEntry[], name: string): number {
  const skill = skills.find((entry) => entry.name === name);
  if (!skill) {
    throw new Error(`Unknown skill: ${name}`);
  }
  return skill.bonus;
}

export function formatSignedBonus(value: number): string {
  return formatSigned(value);
}
