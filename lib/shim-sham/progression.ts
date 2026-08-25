import type { LevelSnapshot } from "@/lib/types";
import { armorClass } from "@/lib/shim-sham/armor";
import { classDc } from "@/lib/shim-sham/class-dc";
import { perception } from "@/lib/shim-sham/perception";
import { savingThrows } from "@/lib/shim-sham/saves";

type LevelProgression = Omit<
  LevelSnapshot,
  "ac" | "fort" | "reflex" | "will" | "perception" | "classDc"
>;

/** Level progression from https://gist.github.com/keesey/7ae2c20287b0555a44d3f910eecb4530
 *  Gist vs calculated values: data/progression-gist-issues.md
 *  Speeds exclude Stylish Combatant / Vivacious Speed (applied at runtime).
 */
export const PROGRESSION: LevelProgression[] = [
  {
    level: 1,
    abilities: { STR: 1, DEX: 4, CON: 0, INT: 0, WIS: 1, CHA: 3 },
    maxHp: 18,
    landSpeed: 25,
    preciseStrike: 2,
    finisherDice: "2d6",
    notes: ["Panache", "Precise Strike 2", "Battledancer", "Confident Finisher"],
  },
  {
    level: 2,
    abilities: { STR: 1, DEX: 4, CON: 0, INT: 0, WIS: 1, CHA: 3 },
    maxHp: 28,
    landSpeed: 25,
    preciseStrike: 2,
    finisherDice: "2d6",
    notes: ["Dirty Trick", "Duelist Dedication", "Quick Draw"],
  },
  {
    level: 3,
    abilities: { STR: 1, DEX: 4, CON: 0, INT: 0, WIS: 1, CHA: 3 },
    maxHp: 41,
    landSpeed: 30,
    climbSpeed: 25,
    preciseStrike: 2,
    finisherDice: "2d6",
    notes: [
      "Fortitude Expertise",
      "Toughness",
      "Opportune Riposte",
      "Performance Expert",
      "Acrobatics Expert",
      "Vivacious Speed +10",
      "Advanced Tempweave",
    ],
  },
  {
    level: 4,
    abilities: { STR: 1, DEX: 4, CON: 0, INT: 0, WIS: 1, CHA: 3 },
    maxHp: 52,
    landSpeed: 30,
    climbSpeed: 25,
    preciseStrike: 2,
    finisherDice: "2d6",
    notes: ["Slippery Prey", "Leading Dance", "Commercial Force Field"],
  },
  {
    level: 5,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    maxHp: 68,
    landSpeed: 30,
    flySpeed: 20,
    climbSpeed: 25,
    preciseStrike: 3,
    finisherDice: "3d6",
    notes: ["Climbing Claws", "Weapon Expertise", "Athletics Trained"],
  },
  {
    level: 6,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    maxHp: 80,
    landSpeed: 30,
    flySpeed: 20,
    climbSpeed: 25,
    preciseStrike: 3,
    finisherDice: "3d6",
    notes: ["Combat Climber", "Dueling Parry"],
  },
  {
    level: 7,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    maxHp: 92,
    landSpeed: 30,
    flySpeed: 25,
    climbSpeed: 30,
    preciseStrike: 3,
    finisherDice: "3d6",
    notes: [
      "Confident Evasion",
      "Feather Step",
      "Performance Master",
      "Acrobatics Master",
      "Vivacious Speed +15",
      "Weapon Specialization",
    ],
  },
  {
    level: 8,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    maxHp: 104,
    landSpeed: 30,
    flySpeed: 25,
    climbSpeed: 30,
    preciseStrike: 3,
    finisherDice: "3d6",
    notes: ["Quick Jump", "Charmed Life"],
  },
  {
    level: 9,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    maxHp: 116,
    landSpeed: 30,
    flySpeed: 25,
    climbSpeed: 30,
    preciseStrike: 4,
    finisherDice: "4d6",
    notes: ["Meyel's Melody", "Exemplary Finisher (Step)", "Intimidation Expert"],
  },
  {
    level: 10,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    maxHp: 138,
    landSpeed: 35,
    flySpeed: 30,
    climbSpeed: 35,
    preciseStrike: 4,
    finisherDice: "4d6",
    notes: ["Intimidating Prowess", "Dueling Riposte"],
  },
  {
    level: 11,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    maxHp: 151,
    landSpeed: 35,
    flySpeed: 30,
    climbSpeed: 35,
    preciseStrike: 4,
    finisherDice: "4d6",
    notes: [
      "Continuous Flair",
      "Incredible Scout",
      "Perception Mastery",
      "Thievery Expert",
      "Vivacious Speed +20",
    ],
  },
  {
    level: 12,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    maxHp: 164,
    landSpeed: 35,
    flySpeed: 30,
    climbSpeed: 35,
    preciseStrike: 4,
    finisherDice: "4d6",
    notes: ["Tumbling Theft", "Mobile Finisher"],
  },
  {
    level: 13,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    maxHp: 177,
    landSpeed: 35,
    flySpeed: 30,
    climbSpeed: 35,
    preciseStrike: 5,
    finisherDice: "5d6",
    notes: [
      "Predatory (Claws)",
      "Assured Evasion",
      "Light Armor Expertise",
      "Athletics Expert",
      "Weapon Mastery",
    ],
  },
  {
    level: 14,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    maxHp: 190,
    landSpeed: 35,
    flySpeed: 30,
    climbSpeed: 35,
    preciseStrike: 5,
    finisherDice: "5d6",
    notes: ["Virtuosic Performer", "Selfless Parry"],
  },
  {
    level: 15,
    abilities: { STR: 4, DEX: 5, CON: 3, INT: 1, WIS: 1, CHA: 5 },
    maxHp: 218,
    landSpeed: 40,
    flySpeed: 35,
    climbSpeed: 40,
    preciseStrike: 5,
    finisherDice: "5d6",
    notes: [
      "Incredible Initiative",
      "Greater Weapon Specialization",
      "Keen Flair",
      "Acrobatics Legendary",
      "Performance Legendary",
      "Vivacious Speed +25",
      "Language: Diabolic",
    ],
  },
];

function withDerivedStats(entry: LevelProgression): LevelSnapshot {
  return {
    ...entry,
    ac: armorClass(entry.abilities.DEX, entry.level),
    perception: perception(entry.abilities.WIS, entry.level),
    classDc: classDc(entry.abilities.DEX, entry.level),
    ...savingThrows(entry.abilities, entry.level),
  };
}

export function getLevelSnapshot(level: number): LevelSnapshot | undefined {
  const entry = PROGRESSION.find((item) => item.level === level);
  return entry ? withDerivedStats(entry) : undefined;
}

export function getNextLevelSnapshot(level: number): LevelSnapshot | undefined {
  const entry = PROGRESSION.find((item) => item.level === level + 1);
  return entry ? withDerivedStats(entry) : undefined;
}
