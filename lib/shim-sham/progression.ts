import type { LevelSnapshot, ProgressionFeat } from "@/lib/types";
import { armorClass } from "@/lib/shim-sham/armor";
import { classDc } from "@/lib/shim-sham/class-dc";
import { maxHp } from "@/lib/shim-sham/max-hp";
import { perception } from "@/lib/shim-sham/perception";
import { savingThrows } from "@/lib/shim-sham/saves";

type LevelProgression = Omit<
  LevelSnapshot,
  "ac" | "fort" | "reflex" | "will" | "perception" | "classDc" | "maxHp"
>;

const AON = "https://2e.aonsrd.com";
const AONP = "https://2e.aonprd.com";
const SWASHBUCKLER = `${AONP}/Classes.aspx?ID=63`;
const BATTLEDANCER = `${AONP}/Styles.aspx?ID=7`;

const feat = (name: string, url: string): ProgressionFeat => ({ name, url, kind: "feat" });
const classFeature = (name: string, url: string): ProgressionFeat => ({
  name,
  url,
  kind: "class-feature",
});

/** Level progression from https://gist.github.com/keesey/7ae2c20287b0555a44d3f910eecb4530
 *  Gist vs calculated values: data/progression-gist-issues.md
 *  Land speed: lib/shim-sham/ancestry.ts (Stylish Combatant / Vivacious Speed at runtime).
 */
export const PROGRESSION: LevelProgression[] = [
  {
    level: 1,
    abilities: { STR: 1, DEX: 4, CON: 0, INT: 0, WIS: 1, CHA: 3 },
    preciseStrike: 2,
    finisherDice: "2d6",
    feats: [
      feat("Meyel's Chosen (Heritage)", `${AON}/ancestries/12-pahtra/heritages/52-meyels-chosen-pahtra`),
      feat("Predatory (Jaws)", `${AON}/feats/331-predatory`),
      feat("Group Coercion", `${AON}/feats/811-group-coercion`),
      classFeature("Panache", SWASHBUCKLER),
      classFeature("Precise Strike 2", SWASHBUCKLER),
      classFeature("Stylish Combatant", SWASHBUCKLER),
      classFeature("Battledancer", BATTLEDANCER),
      feat("Fascinating Performance", `${AON}/feats/801-fascinating-performance`),
      classFeature("Confident Finisher", `${AONP}/Actions.aspx?ID=550`),
      feat("Focused Fascination", `${AONP}/Feats.aspx?ID=6131`),
    ],
  },
  {
    level: 2,
    abilities: { STR: 1, DEX: 4, CON: 0, INT: 0, WIS: 1, CHA: 3 },
    preciseStrike: 2,
    finisherDice: "2d6",
    feats: [
      feat("Dirty Trick", `${AONP}/Feats.aspx?ID=6472`),
      feat("Duelist Dedication", `${AONP}/Feats.aspx?ID=6313`),
      feat("Quick Draw", `${AONP}/Feats.aspx?ID=4869`),
    ],
  },
  {
    level: 3,
    abilities: { STR: 1, DEX: 4, CON: 0, INT: 0, WIS: 1, CHA: 3 },
    preciseStrike: 2,
    finisherDice: "2d6",
    feats: [
      classFeature("Fortitude Expertise", SWASHBUCKLER),
      feat("Toughness", `${AON}/feats/899-toughness`),
      classFeature("Opportune Riposte", `${AONP}/Actions.aspx?ID=2819`),
      feat("Cat Fall", `${AON}/feats/775-cat-fall`),
      classFeature("Vivacious Speed +10", SWASHBUCKLER),
    ],
  },
  {
    level: 4,
    abilities: { STR: 1, DEX: 4, CON: 0, INT: 0, WIS: 1, CHA: 3 },
    preciseStrike: 2,
    finisherDice: "2d6",
    feats: [
      feat("Slippery Prey", `${AONP}/Feats.aspx?ID=6505`),
      feat("Leading Dance", `${AONP}/Feats.aspx?ID=6149`),
    ],
  },
  {
    level: 5,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 3,
    finisherDice: "3d6",
    feats: [
      feat("Climbing Claws", `${AON}/feats/333-climbing-claws`),
      classFeature("Precise Strike 3", SWASHBUCKLER),
      classFeature("Weapon Expertise", SWASHBUCKLER),
    ],
  },
  {
    level: 6,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 3,
    finisherDice: "3d6",
    feats: [
      feat("Combat Climber", `${AON}/feats/778-combat-climber`),
      feat("Dueling Parry", `${AONP}/Feats.aspx?ID=4781`),
    ],
  },
  {
    level: 7,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 3,
    finisherDice: "3d6",
    feats: [
      classFeature("Confident Evasion", SWASHBUCKLER),
      feat("Feather Step", `${AON}/feats/804-feather-step`),
      feat("Kip Up", `${AON}/feats/824-kip-up`),
      classFeature("Vivacious Speed +15", SWASHBUCKLER),
      classFeature("Weapon Specialization", SWASHBUCKLER),
    ],
  },
  {
    level: 8,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 3,
    finisherDice: "3d6",
    feats: [
      feat("Quick Jump", `${AON}/feats/863-quick-jump`),
      feat("Charmed Life", `${AONP}/Feats.aspx?ID=6138`),
    ],
  },
  {
    level: 9,
    abilities: { STR: 2, DEX: 4, CON: 1, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 4,
    finisherDice: "4d6",
    feats: [
      feat("Meyel's Melody", `${AON}/feats/337-meyels-melody`),
      classFeature("Exemplary Finisher (Step)", BATTLEDANCER),
      classFeature("Precise Strike 4", SWASHBUCKLER),
    ],
  },
  {
    level: 10,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 4,
    finisherDice: "4d6",
    feats: [
      feat("Intimidating Prowess", `${AON}/feats/820-intimidating-prowess`),
      feat("Dueling Riposte", `${AONP}/Feats.aspx?ID=4811`),
    ],
  },
  {
    level: 11,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 4,
    finisherDice: "4d6",
    feats: [
      classFeature("Continuous Flair", SWASHBUCKLER),
      feat("Incredible Scout", `${AONP}/Feats.aspx?ID=6487`),
      classFeature("Perception Mastery", SWASHBUCKLER),
      classFeature("Vivacious Speed +20", SWASHBUCKLER),
    ],
  },
  {
    level: 12,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 4,
    finisherDice: "4d6",
    feats: [
      feat("Tumbling Theft", `${AONP}/Feats.aspx?ID=6513`),
      feat("Mobile Finisher", `${AONP}/Feats.aspx?ID=6170`),
    ],
  },
  {
    level: 13,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 5,
    finisherDice: "5d6",
    feats: [
      feat("Predatory (Claws)", `${AON}/feats/331-predatory`),
      classFeature("Assured Evasion", SWASHBUCKLER),
      classFeature("Light Armor Expertise", SWASHBUCKLER),
      classFeature("Precise Strike 5", SWASHBUCKLER),
      classFeature("Weapon Mastery", SWASHBUCKLER),
    ],
  },
  {
    level: 14,
    abilities: { STR: 3, DEX: 5, CON: 2, INT: 0, WIS: 1, CHA: 4 },
    preciseStrike: 5,
    finisherDice: "5d6",
    feats: [
      feat("Virtuosic Performer", `${AON}/feats/907-virtuosic-performer`),
      feat("Selfless Parry", `${AONP}/Feats.aspx?ID=6315`),
    ],
  },
  {
    level: 15,
    abilities: { STR: 4, DEX: 5, CON: 3, INT: 1, WIS: 1, CHA: 5 },
    preciseStrike: 5,
    finisherDice: "5d6",
    feats: [
      feat("Incredible Initiative", `${AON}/feats/818-incredible-initiative`),
      classFeature("Greater Weapon Specialization", SWASHBUCKLER),
      classFeature("Keen Flair", SWASHBUCKLER),
      feat("Legendary Performer", `${AON}/feats/831-legendary-performer`),
      classFeature("Vivacious Speed +25", SWASHBUCKLER),
    ],
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
