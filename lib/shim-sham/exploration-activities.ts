import type { SkillEntry } from "@/lib/types";

const AON = "https://2e.aonsrd.com";

export type ExplorationActivity = {
  id: string;
  name: string;
  url: string;
  /** Skill name from the sheet, or "Perception" for the Perception modifier. */
  bonusSource?: string;
};

/**
 * Exploration activities Shim Sham can perform.
 * @see https://2e.aonsrd.com/rules/667-exploration-activities
 */
export const SHIM_SHAM_EXPLORATION: readonly ExplorationActivity[] = [
  {
    id: "avoid-notice",
    name: "Avoid Notice",
    url: `${AON}/actions/32-avoid-notice`,
    bonusSource: "Stealth",
  },
  {
    id: "coerce",
    name: "Coerce",
    url: `${AON}/actions/84-coerce`,
    bonusSource: "Intimidation",
  },
  {
    id: "group-coercion",
    name: "Group Coercion",
    url: `${AON}/feats/811-group-coercion`,
    bonusSource: "Intimidation",
  },
  {
    id: "decipher-writing",
    name: "Decipher Writing",
    url: `${AON}/actions/46-decipher-writing`,
    bonusSource: "Lore (Piracy)",
  },
  {
    id: "follow-the-expert",
    name: "Follow the Expert",
    url: `${AON}/actions/35-follow-the-expert`,
  },
  {
    id: "gather-information",
    name: "Gather Information",
    url: `${AON}/actions/81-gather-information`,
    bonusSource: "Diplomacy",
  },
  { id: "hustle", name: "Hustle", url: `${AON}/actions/36-hustle` },
  {
    id: "investigate",
    name: "Investigate",
    url: `${AON}/actions/39-investigate`,
    bonusSource: "Lore (Piracy)",
  },
  {
    id: "make-an-impression",
    name: "Make an Impression",
    url: `${AON}/actions/82-make-an-impression`,
    bonusSource: "Diplomacy",
  },
  {
    id: "navigate",
    name: "Navigate",
    url: `${AON}/actions/93-navigate`,
    bonusSource: "Piloting",
  },
  {
    id: "plot-course",
    name: "Plot Course",
    url: `${AON}/actions/94-plot-course`,
    bonusSource: "Piloting",
  },
  { id: "recharge", name: "Recharge", url: `${AON}/actions/41-recharge` },
  {
    id: "scout",
    name: "Scout",
    url: `${AON}/actions/43-scout`,
  },
  {
    id: "search",
    name: "Search",
    url: `${AON}/actions/44-search`,
    bonusSource: "Perception",
  },
  {
    id: "squeeze",
    name: "Squeeze",
    url: `${AON}/actions/60-squeeze`,
    bonusSource: "Acrobatics",
  },
];

export function explorationActivityBonus(
  activity: ExplorationActivity,
  skills: SkillEntry[],
  perception: number,
): number | undefined {
  if (!activity.bonusSource) {
    return undefined;
  }
  if (activity.bonusSource === "Perception") {
    return perception;
  }
  return skills.find((entry) => entry.name === activity.bonusSource)?.bonus;
}

export function orderedExplorationActivities(
  activities: readonly ExplorationActivity[],
): ExplorationActivity[] {
  return [...activities].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}
