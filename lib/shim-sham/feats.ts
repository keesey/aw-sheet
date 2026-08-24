/** Feats and class features by level — from the Shim Sham progression plan. */
export type ProgressionFeat = {
  name: string;
  url: string;
};

export type LevelFeats = {
  level: number;
  entries: ProgressionFeat[];
};

const AON = "https://2e.aonsrd.com";
const AONP = "https://2e.aonprd.com";
const SWASHBUCKLER = `${AONP}/Classes.aspx?ID=63`;
const BATTLEDANCER = `${AONP}/Styles.aspx?ID=7`;

export const FEATS_BY_LEVEL: LevelFeats[] = [
  {
    level: 1,
    entries: [
      {
        name: "Meyel's Chosen (Heritage)",
        url: `${AON}/ancestries/12-pahtra/heritages/52-meyels-chosen-pahtra`,
      },
      { name: "Predatory (Jaws)", url: `${AON}/feats/331-predatory` },
      { name: "Group Coercion", url: `${AON}/feats/811-group-coercion` },
      { name: "Panache", url: SWASHBUCKLER },
      { name: "Precise Strike 2", url: SWASHBUCKLER },
      { name: "Stylish Combatant", url: SWASHBUCKLER },
      { name: "Battledancer", url: BATTLEDANCER },
      { name: "Fascinating Performance", url: `${AON}/feats/801-fascinating-performance` },
      { name: "Confident Finisher", url: `${AONP}/Actions.aspx?ID=550` },
      { name: "Focused Fascination", url: `${AONP}/Feats.aspx?ID=6131` },
    ],
  },
  {
    level: 2,
    entries: [
      { name: "Dirty Trick", url: `${AONP}/Feats.aspx?ID=6472` },
      { name: "Duelist Dedication", url: `${AONP}/Feats.aspx?ID=6313` },
      { name: "Quick Draw", url: `${AONP}/Feats.aspx?ID=4869` },
    ],
  },
  {
    level: 3,
    entries: [
      { name: "Fortitude Expertise", url: SWASHBUCKLER },
      { name: "Toughness", url: `${AON}/feats/899-toughness` },
      { name: "Opportune Riposte", url: `${AONP}/Actions.aspx?ID=2819` },
      { name: "Cat Fall", url: `${AON}/feats/775-cat-fall` },
      { name: "Vivacious Speed +10", url: SWASHBUCKLER },
    ],
  },
  {
    level: 4,
    entries: [
      { name: "Slippery Prey", url: `${AONP}/Feats.aspx?ID=6505` },
      { name: "Leading Dance", url: `${AONP}/Feats.aspx?ID=6149` },
    ],
  },
  {
    level: 5,
    entries: [
      { name: "Climbing Claws", url: `${AON}/feats/333-climbing-claws` },
      { name: "Precise Strike 3", url: SWASHBUCKLER },
      { name: "Weapon Expertise", url: SWASHBUCKLER },
    ],
  },
  {
    level: 6,
    entries: [
      { name: "Combat Climber", url: `${AON}/feats/778-combat-climber` },
      { name: "Dueling Parry", url: `${AONP}/Feats.aspx?ID=4781` },
    ],
  },
  {
    level: 7,
    entries: [
      { name: "Confident Evasion", url: SWASHBUCKLER },
      { name: "Feather Step", url: `${AON}/feats/804-feather-step` },
      { name: "Kip Up", url: `${AON}/feats/824-kip-up` },
      { name: "Vivacious Speed +15", url: SWASHBUCKLER },
      { name: "Weapon Specialization", url: SWASHBUCKLER },
    ],
  },
  {
    level: 8,
    entries: [
      { name: "Quick Jump", url: `${AON}/feats/863-quick-jump` },
      { name: "Charmed Life", url: `${AONP}/Feats.aspx?ID=6138` },
    ],
  },
  {
    level: 9,
    entries: [
      { name: "Meyel's Melody", url: `${AON}/feats/337-meyels-melody` },
      { name: "Exemplary Finisher (Step)", url: BATTLEDANCER },
      { name: "Precise Strike 4", url: SWASHBUCKLER },
    ],
  },
  {
    level: 10,
    entries: [
      { name: "Intimidating Prowess", url: `${AON}/feats/820-intimidating-prowess` },
      { name: "Dueling Riposte", url: `${AONP}/Feats.aspx?ID=4811` },
    ],
  },
  {
    level: 11,
    entries: [
      { name: "Continuous Flair", url: SWASHBUCKLER },
      { name: "Incredible Scout", url: `${AONP}/Feats.aspx?ID=6487` },
      { name: "Perception Mastery", url: SWASHBUCKLER },
      { name: "Vivacious Speed +20", url: SWASHBUCKLER },
    ],
  },
  {
    level: 12,
    entries: [
      { name: "Tumbling Theft", url: `${AONP}/Feats.aspx?ID=6513` },
      { name: "Mobile Finisher", url: `${AONP}/Feats.aspx?ID=6170` },
    ],
  },
  {
    level: 13,
    entries: [
      { name: "Predatory (Claws)", url: `${AON}/feats/331-predatory` },
      { name: "Assured Evasion", url: SWASHBUCKLER },
      { name: "Light Armor Expertise", url: SWASHBUCKLER },
      { name: "Precise Strike 5", url: SWASHBUCKLER },
      { name: "Weapon Mastery", url: SWASHBUCKLER },
    ],
  },
  {
    level: 14,
    entries: [
      { name: "Virtuosic Performer", url: `${AON}/feats/907-virtuosic-performer` },
      { name: "Selfless Parry", url: `${AONP}/Feats.aspx?ID=6315` },
    ],
  },
  {
    level: 15,
    entries: [
      { name: "Incredible Initiative", url: `${AON}/feats/818-incredible-initiative` },
      { name: "Greater Weapon Specialization", url: SWASHBUCKLER },
      { name: "Keen Flair", url: SWASHBUCKLER },
      { name: "Legendary Performer", url: `${AON}/feats/831-legendary-performer` },
      { name: "Vivacious Speed +25", url: SWASHBUCKLER },
    ],
  },
];
