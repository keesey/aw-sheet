export type ActiveCondition = {
  id: string;
  value?: number;
};

export type AonLink = {
  name: string;
  url: string;
};

export type WeaponStrike = {
  id: string;
  name: string;
  attack: string;
  mapAttacks: [number, number, number];
  damage: string;
  damageProfile: StrikeDamageProfile;
  /** Shown on its own line, e.g. "+1d8 deadly on crit". */
  critNote?: string;
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

export type AbilityKey = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

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
  cost: "free" | "single" | "double" | "minute" | "reaction";
  description: string;
  traits?: string[];
  url: string;
  bonus?: string;
  combatBonus?: string;
  /** Omit from the sheet until this character level. */
  minLevel?: number;
  /** Right-side control on the compact action row. */
  control?:
    | "accelerate"
    | "meyel-reroll"
    | "jetpack"
    | "force-field"
    | "dueling-parry"
    | "baton-parry"
    | "take-cover"
    | "strikes"
    | "area-weapons";
};

export type Consumable = {
  id: string;
  name: string;
  url: string;
  quantity: number;
  used: number;
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

export type LevelSnapshot = {
  level: number;
  abilities: Record<AbilityKey, number>;
  maxHp: number;
  ac: number;
  fort: number;
  reflex: number;
  will: number;
  perception: number;
  classDc: number;
  landSpeed: number;
  flySpeed?: number;
  climbSpeed?: number;
  swimSpeed?: number;
  preciseStrike: number;
  finisherDice: string;
  notes: string[];
};

export type RuntimeState = {
  level: number;
  currentHp: number;
  panache: boolean;
  accelerate: boolean;
  jetpack: boolean;
  combat: boolean;
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
    player: string;
    deity: string;
    ancestry: AonLink;
    heritage: AonLink;
    background: AonLink;
    class: AonLink;
    style: AonLink;
    size: string;
    languages: string[];
    homeWorld: string;
    portOfCall: string;
    senses: AonLink[];
    anathema: string[];
    armor: AonLink & { acBonus: number; notes?: string };
    resistances: string[];
    skills: SkillEntry[];
    weapons: WeaponStrike[];
    actions: CharacterAction[];
    inventory: InventoryItem[];
    consumableCatalog: Consumable[];
    planUrl: string;
    playbookUrl: string;
  };
  level: LevelSnapshot;
  runtime: RuntimeState;
};
