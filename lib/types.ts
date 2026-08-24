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
  damage: string;
  /** Shown on its own line, e.g. "+1d8 deadly on crit". */
  critNote?: string;
  traits: string[];
  url: string;
  weaponUrl?: string;
};

export type ProficiencyRank = "U" | "T" | "E" | "M" | "L";

export type AbilityKey = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

export type SkillEntry = {
  name: string;
  bonus: number;
  proficiency: ProficiencyRank;
  url: string;
};

export type CharacterAction = {
  id: string;
  name: string;
  cost: "free" | "single" | "minute" | "reaction";
  summary: string;
  traits?: string[];
  url: string;
  bonus?: string;
  combatBonus?: string;
};

export type Consumable = {
  id: string;
  name: string;
  url: string;
  quantity: number;
  used: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  bulk: string;
  url?: string;
  traits?: string[];
  notes?: string;
  equipmentGroup?: "armor" | "weapon" | "other";
  indented?: boolean;
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
  credits: number;
  conditions: ActiveCondition[];
  forceFieldHp: number;
  forceFieldUsesUsed: number;
  meyelRerollUsed: boolean;
  consumables: Record<string, number>;
  batteries: { id: string; charges: number; max: number }[];
  chemTankCharges: number;
  notes: string;
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
