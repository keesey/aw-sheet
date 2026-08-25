/** Feats and class features by level — from the Shim Sham progression plan. */
export type ProgressionEntryKind = "feat" | "class-feature";

export type ProgressionFeat = {
  name: string;
  url: string;
  kind: ProgressionEntryKind;
};

export type LevelFeats = {
  level: number;
  entries: ProgressionFeat[];
};

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

export const FEATS_BY_LEVEL: LevelFeats[] = [
  {
    level: 1,
    entries: [
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
    entries: [
      feat("Dirty Trick", `${AONP}/Feats.aspx?ID=6472`),
      feat("Duelist Dedication", `${AONP}/Feats.aspx?ID=6313`),
      feat("Quick Draw", `${AONP}/Feats.aspx?ID=4869`),
    ],
  },
  {
    level: 3,
    entries: [
      classFeature("Fortitude Expertise", SWASHBUCKLER),
      feat("Toughness", `${AON}/feats/899-toughness`),
      classFeature("Opportune Riposte", `${AONP}/Actions.aspx?ID=2819`),
      feat("Cat Fall", `${AON}/feats/775-cat-fall`),
      classFeature("Vivacious Speed +10", SWASHBUCKLER),
    ],
  },
  {
    level: 4,
    entries: [
      feat("Slippery Prey", `${AONP}/Feats.aspx?ID=6505`),
      feat("Leading Dance", `${AONP}/Feats.aspx?ID=6149`),
    ],
  },
  {
    level: 5,
    entries: [
      feat("Climbing Claws", `${AON}/feats/333-climbing-claws`),
      classFeature("Precise Strike 3", SWASHBUCKLER),
      classFeature("Weapon Expertise", SWASHBUCKLER),
    ],
  },
  {
    level: 6,
    entries: [
      feat("Combat Climber", `${AON}/feats/778-combat-climber`),
      feat("Dueling Parry", `${AONP}/Feats.aspx?ID=4781`),
    ],
  },
  {
    level: 7,
    entries: [
      classFeature("Confident Evasion", SWASHBUCKLER),
      feat("Feather Step", `${AON}/feats/804-feather-step`),
      feat("Kip Up", `${AON}/feats/824-kip-up`),
      classFeature("Vivacious Speed +15", SWASHBUCKLER),
      classFeature("Weapon Specialization", SWASHBUCKLER),
    ],
  },
  {
    level: 8,
    entries: [
      feat("Quick Jump", `${AON}/feats/863-quick-jump`),
      feat("Charmed Life", `${AONP}/Feats.aspx?ID=6138`),
    ],
  },
  {
    level: 9,
    entries: [
      feat("Meyel's Melody", `${AON}/feats/337-meyels-melody`),
      classFeature("Exemplary Finisher (Step)", BATTLEDANCER),
      classFeature("Precise Strike 4", SWASHBUCKLER),
    ],
  },
  {
    level: 10,
    entries: [
      feat("Intimidating Prowess", `${AON}/feats/820-intimidating-prowess`),
      feat("Dueling Riposte", `${AONP}/Feats.aspx?ID=4811`),
    ],
  },
  {
    level: 11,
    entries: [
      classFeature("Continuous Flair", SWASHBUCKLER),
      feat("Incredible Scout", `${AONP}/Feats.aspx?ID=6487`),
      classFeature("Perception Mastery", SWASHBUCKLER),
      classFeature("Vivacious Speed +20", SWASHBUCKLER),
    ],
  },
  {
    level: 12,
    entries: [
      feat("Tumbling Theft", `${AONP}/Feats.aspx?ID=6513`),
      feat("Mobile Finisher", `${AONP}/Feats.aspx?ID=6170`),
    ],
  },
  {
    level: 13,
    entries: [
      feat("Predatory (Claws)", `${AON}/feats/331-predatory`),
      classFeature("Assured Evasion", SWASHBUCKLER),
      classFeature("Light Armor Expertise", SWASHBUCKLER),
      classFeature("Precise Strike 5", SWASHBUCKLER),
      classFeature("Weapon Mastery", SWASHBUCKLER),
    ],
  },
  {
    level: 14,
    entries: [
      feat("Virtuosic Performer", `${AON}/feats/907-virtuosic-performer`),
      feat("Selfless Parry", `${AONP}/Feats.aspx?ID=6315`),
    ],
  },
  {
    level: 15,
    entries: [
      feat("Incredible Initiative", `${AON}/feats/818-incredible-initiative`),
      classFeature("Greater Weapon Specialization", SWASHBUCKLER),
      classFeature("Keen Flair", SWASHBUCKLER),
      feat("Legendary Performer", `${AON}/feats/831-legendary-performer`),
      classFeature("Vivacious Speed +25", SWASHBUCKLER),
    ],
  },
];

export function getFeatsForLevel(level: number): ProgressionFeat[] {
  return FEATS_BY_LEVEL.find((item) => item.level === level)?.entries ?? [];
}
