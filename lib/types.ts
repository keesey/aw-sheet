export type ActiveCondition = {
  id: string;
  value?: number;
};

type AonLink = {
  name: string;
  url: string;
};

export type WeaponStrike = {
  id: string;
  name: string;
  mapAttacks: [number, number, number];
  damage: string;
  damageProfile: StrikeDamageProfile;
  /** Shown on its own line, e.g. "+1d8 deadly on crit". */
  critNote?: string;
  /** Weapon group critical specialization when expert+ (Weapon Expertise 5+). */
  critSpecialization?: string;
  traits: string[];
  url: string;
  weaponUrl?: string;
  ranged?: boolean;
  /** First range increment in feet. */
  rangeIncrement?: number;
};

/** Structured damage for strike attack rolls. */
export type StrikeDamageProfile = {
  weaponDice: string;
  flatBonus: number;
  damageType: string;
  preciseStrike: number;
  finisherDice: string;
  critNote?: string;
  /** e.g. "1d8" from "+1d8 deadly on crit". */
  critDice?: string;
};

export type ProficiencyRank = "U" | "T" | "E" | "M" | "L";

export type AttributeKey = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

export type SkillEntry = {
  name: string;
  bonus: number;
  proficiency: ProficiencyRank;
  url: string;
};

export type CoverLevel = "none" | "standard" | "greater";

export type CharacterAction = {
  id: string;
  name: string;
  cost: "free" | "single" | "double" | "triple" | "reaction";
  description: string;
  traits?: string[];
  url: string;
  bonus?: string;
  combatBonus?: string;
  /** Omit from the sheet until this character level. */
  minLevel?: number;
  /** Shown only when the Vehicles toggle is on. */
  vehiclesOnly?: boolean;
  /** Right-side control on the compact action row. */
  control?:
    | "accelerate"
    | "meyel-reroll"
    | "jetpack"
    | "force-field"
    | "dueling-parry"
    | "baton-parry"
    | "take-cover"
    | "prepare-to-aid"
    | "aid"
    | "drop-prone"
    | "stand"
    | "delay"
    | "return-to-initiative"
    | "strikes"
    | "area-weapons";
};

export type Consumable = {
  id: string;
  name: string;
  url: string;
  quantity: number;
  bulk: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  bulk: string;
  url?: string;
  traits?: string[];
  notes?: string;
  equipmentGroup?: "armor" | "weapon" | "other" | "valuable";
  indented?: boolean;
};

/** Session-only inventory entries added from the inventory panel. */
export type AdHocInventoryItem = {
  id: string;
  name: string;
  bulk: string;
  url?: string;
};

type ProgressionEntryKind = "feat" | "class-feature";

export type ProgressionFeat = {
  name: string;
  url: string;
  kind: ProgressionEntryKind;
};

export type LevelSnapshot = {
  level: number;
  attributes: Record<AttributeKey, number>;
  maxHp: number;
  ac: number;
  fort: number;
  reflex: number;
  will: number;
  perception: number;
  classDc: number;
  swimSpeed?: number;
  finisherDice: string;
};

/** Internal progression row with fields used when building strikes, not sent on the sheet API. */
export type ProgressionSnapshot = LevelSnapshot & {
  preciseStrike: number;
  feats: ProgressionFeat[];
};

export type RuntimeState = {
  level: number;
  currentHp: number;
  panache: boolean;
  accelerate: boolean;
  jetpack: boolean;
  vehicles: boolean;
  encounter: boolean;
  duelingParry: boolean;
  batonParry: boolean;
  cover: CoverLevel;
  credits: number;
  conditions: ActiveCondition[];
  forceFieldHp: number;
  forceFieldUsesUsed: number;
  /** True from Activate until Deactivate; independent of current temp HP. */
  forceFieldActive: boolean;
  meyelRerollUsed: boolean;
  preparedToAid: boolean;
  delayed: boolean;
  consumables: Record<string, number>;
  batteries: { id: string; charges: number; max: number }[];
  chemTankCharges: number;
  notes: string;
  adHocItems: AdHocInventoryItem[];
};

export type CharacterSheet = {
  static: {
    name: string;
    nickname: string;
    deity: AonLink;
    ancestry: AonLink;
    heritage: AonLink;
    background: AonLink;
    class: AonLink;
    style: AonLink;
    languages: AonLink[];
    homeWorld: AonLink;
    portOfCall: AonLink;
    senses: AonLink[];
    anathema: string[];
    armor: AonLink;
    skills: SkillEntry[];
    weapons: WeaponStrike[];
    actions: CharacterAction[];
    inventory: InventoryItem[];
    consumableCatalog: Consumable[];
    planUrl: string;
  };
  level: LevelSnapshot;
  runtime: RuntimeState;
};
