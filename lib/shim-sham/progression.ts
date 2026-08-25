import type { LevelSnapshot } from "@/lib/types";
import { armorClass } from "@/lib/shim-sham/armor";
import { classDc } from "@/lib/shim-sham/class-dc";
import { maxHp } from "@/lib/shim-sham/max-hp";
import { perception } from "@/lib/shim-sham/perception";
import { savingThrows } from "@/lib/shim-sham/saves";

type LevelProgression = Omit<
  LevelSnapshot,
  "ac" | "fort" | "reflex" | "will" | "perception" | "classDc" | "maxHp"
>;

/** Level progression from https://gist.github.com/keesey/7ae2c20287b0555a44d3f910eecb4530
 *  Gist vs calculated values: data/progression-gist-issues.md
 *  Land speed: lib/shim-sham/ancestry.ts (Stylish Combatant / Vivacious Speed at runtime).
 *  Feats and class features: lib/shim-sham/feats.ts
 */
export const PROGRESSION: LevelProgression[] = [
  {
    level: 1,
    abilities: { STR: 1, DEX: 4, CON: 0, INT: 0, WIS: 1, CHA: 3 },
    preciseStrike: 2,
    finisherDice: "2d6",
  },
  {
    level: 2,
    abilities: { STR: 1, DEX: 4, CON: 0, INT: 0, WIS: 1, CHA: 3 },
    preciseStrike: 2,
    finisherDice: "2d6",
  },
  {
    level: 3,
    abilities: { STR: 1, DEX: 4, CON: 0, INT: 0, WIS: 1, CHA: 3 },
    preciseStrike: 2,
    finisherDice: "2d6",
  },
  {
    level: 4,
    abilities: { STR: 1, DEX: 4, CON: 0, INT: 0, WIS: 1, CHA: 3 },
    preciseStrike: 2,
    finisherDice: "2d6",
  },
  {
    level: 5,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 3,
    finisherDice: "3d6",
  },
  {
    level: 6,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 3,
    finisherDice: "3d6",
  },
  {
    level: 7,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 3,
    finisherDice: "3d6",
  },
  {
    level: 8,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 3,
    finisherDice: "3d6",
  },
  {
    level: 9,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 4,
    finisherDice: "4d6",
  },
  {
    level: 10,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 4,
    finisherDice: "4d6",
  },
  {
    level: 11,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 4,
    finisherDice: "4d6",
  },
  {
    level: 12,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 4,
    finisherDice: "4d6",
  },
  {
    level: 13,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 5,
    finisherDice: "5d6",
  },
  {
    level: 14,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 5,
    finisherDice: "5d6",
  },
  {
    level: 15,
    abilities: { STR: 4, DEX: 5, CON: 3, INT: 1, WIS: 1, CHA: 5 },
    preciseStrike: 5,
    finisherDice: "5d6",
  },
];

function withDerivedStats(entry: LevelProgression): LevelSnapshot {
  return {
    ...entry,
    maxHp: maxHp(entry.level, entry.abilities.CON),
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
