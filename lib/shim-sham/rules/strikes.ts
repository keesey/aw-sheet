import type { AttributeKey, ProficiencyRank, ProgressionSnapshot, StrikeDamageProfile, WeaponStrike } from "@/lib/types";
import {
  criticalSpecializationEffect,
  hasCriticalSpecialization,
  type WeaponGroup,
} from "@/lib/shim-sham/rules/critical-specialization";
import { proficiencyBonus, proficiencyRankAtLevel } from "@/lib/shim-sham/rules/proficiency";

const AON = "https://2e.aonsrd.com";

type WeaponCategory = "simple" | "martial" | "unarmed";

type StrikeDefinition = {
  id: string;
  name: string;
  category: WeaponCategory;
  weaponGroup: WeaponGroup;
  /** Ranged attacks always use Dex. Melee uses Str unless finesse. */
  ranged?: boolean;
  finesse?: boolean;
  agile?: boolean;
  /** Item bonus to attack from the Tracking trait (0 if none). */
  tracking: number;
  /** First range increment in feet (ranged weapons only). */
  rangeIncrement?: number;
  dice: string;
  damageType: string;
  /** Shown on its own line below damage, e.g. "+1d8 deadly on crit". */
  critNote?: string;
  expend?: number;
  traits: string[];
  url: string;
  weaponUrl?: string;
};

/**
 * Swashbuckler weapon ranks: trained at 1, Weapon Expertise at 5,
 * Weapon Mastery at 13. Same ranks for simple, martial, and unarmed.
 * @see https://2e.aonprd.com/Classes.aspx?ID=63
 */
const WEAPON_RANKS: ReadonlyArray<{ level: number; rank: ProficiencyRank }> = [
  { level: 1, rank: "T" },
  { level: 5, rank: "E" },
  { level: 13, rank: "M" },
];

const SHIM_SHAM_STRIKES: readonly StrikeDefinition[] = [
  {
    id: "baton",
    name: "Baton (Tactical)",
    category: "simple",
    weaponGroup: "club",
    finesse: true,
    tracking: 1,
    dice: "1d6",
    damageType: "B",
    traits: ["Club", "Finesse", "Nonlethal", "Parry"],
    url: `${AON}/actions/15-strike`,
    weaponUrl: `${AON}/equipment/weapons/2-baton`,
  },
  {
    id: "battle-ribbon",
    name: "Battle Ribbon",
    category: "martial",
    weaponGroup: "flail",
    finesse: true,
    tracking: 0,
    dice: "1d4",
    damageType: "S",
    traits: ["Flail", "Finesse", "Nonlethal", "Reach", "Trip"],
    url: `${AON}/actions/15-strike`,
    weaponUrl: `${AON}/equipment/weapons/9-battle-ribbon`,
  },
  {
    id: "jaws",
    name: "Jaws",
    category: "unarmed",
    weaponGroup: "brawling",
    finesse: true,
    tracking: 0,
    dice: "1d6",
    damageType: "P",
    traits: ["Brawling", "Finesse", "Grapple", "Pahtra", "Unarmed"],
    url: `${AON}/actions/15-strike`,
    weaponUrl: `${AON}/feats/331-predatory`,
  },
  {
    id: "rapier",
    name: "Nano-Edge Rapier (Advanced)",
    category: "martial",
    weaponGroup: "sword",
    finesse: true,
    tracking: 1,
    dice: "2d6",
    damageType: "P",
    critNote: "+1d8 deadly",
    traits: ["Sword", "Deadly d8", "Disarm", "Finesse"],
    url: `${AON}/actions/15-strike`,
    weaponUrl: `${AON}/equipment/weapons/17-nano-edge-rapier`,
  },
  {
    id: "tailblade",
    name: "Tailblade (Advanced)",
    category: "martial",
    weaponGroup: "knife",
    finesse: true,
    agile: true,
    tracking: 1,
    dice: "2d4",
    damageType: "S",
    traits: ["Knife", "Agile", "Finesse", "Free-hand"],
    url: `${AON}/actions/15-strike`,
    weaponUrl: `${AON}/equipment/weapons/29-tailblade`,
  },
  {
    id: "zero-knife",
    name: "Zero Knife",
    category: "simple",
    weaponGroup: "knife",
    finesse: true,
    agile: true,
    tracking: 0,
    dice: "1d4",
    damageType: "C/P",
    traits: ["Knife", "Agile", "Finesse", "Powered", "Versatile P"],
    url: `${AON}/actions/15-strike`,
    weaponUrl: `${AON}/equipment/weapons/7-zero-knife`,
  },
  {
    id: "zero-pistol",
    name: "Zero Pistol (Advanced)",
    category: "simple",
    weaponGroup: "cryo",
    ranged: true,
    tracking: 1,
    rangeIncrement: 30,
    dice: "2d6",
    damageType: "C",
    expend: 2,
    traits: ["Tech"],
    url: `${AON}/actions/15-strike`,
    weaponUrl: `${AON}/equipment/weapons/48-zero-pistol`,
  },
];

function signed(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

/** Sixth range increment is the maximum; attacks beyond that are impossible. */
export const MAX_RANGE_INCREMENT_COUNT = 6;

/** −2 per range increment beyond the first. @see https://2e.aonsrd.com/rules/336-attack-rolls */
export function rangeAttackPenalty(incrementsBeyondFirst: number): number {
  return incrementsBeyondFirst <= 0 ? 0 : -2 * incrementsBeyondFirst;
}

/** Upper distance in feet for a selected range increment band (1-based count). */
export function rangeIncrementMaxFeet(rangeIncrement: number, incrementsBeyondFirst: number): number {
  return (incrementsBeyondFirst + 1) * rangeIncrement;
}

function mapAttackValues(first: number, agile: boolean): [number, number, number] {
  const secondPenalty = agile ? 4 : 5;
  const thirdPenalty = agile ? 8 : 10;
  return [first, first - secondPenalty, first - thirdPenalty];
}

function formatMapAttacks(first: number, agile: boolean): string {
  return mapAttackValues(first, agile).map(signed).join(" / ");
}

const SLIPPERY_PREY_LEVEL = 4;

/** Second and third MAP penalties for Escape with Slippery Prey (Acrobatics). */
function escapeMapPenalties(
  acrobaticsRank: ProficiencyRank,
  hasSlipperyPrey: boolean,
): [number, number] {
  if (!hasSlipperyPrey || acrobaticsRank === "U") {
    return [5, 10];
  }
  if (acrobaticsRank === "L") {
    return [0, 0];
  }
  if (acrobaticsRank === "M") {
    return [3, 6];
  }
  return [4, 8];
}

/** Escape MAP: standard, or reduced by Slippery Prey when trained in Acrobatics. */
export function formatEscapeMapBonus(
  first: number,
  acrobaticsRank: ProficiencyRank,
  characterLevel: number,
): string {
  const [secondPenalty, thirdPenalty] = escapeMapPenalties(
    acrobaticsRank,
    characterLevel >= SLIPPERY_PREY_LEVEL,
  );
  return [first, first - secondPenalty, first - thirdPenalty].map(signed).join(" / ");
}

export function formatSkillAttackMapBonus(bonus: string): string {
  const match = bonus.match(/^([+-]?\d+)/);
  if (!match) return bonus;
  return formatMapAttacks(parseInt(match[1], 10), false);
}

function attackAttribute(strike: StrikeDefinition): AttributeKey {
  if (strike.ranged || strike.finesse) return "DEX";
  return "STR";
}

function weaponRank(level: number): ProficiencyRank {
  return proficiencyRankAtLevel(WEAPON_RANKS, level);
}

/**
 * Extra damage from Weapon Specialization (7) / Greater (15).
 * @see https://2e.aonprd.com/Classes.aspx?ID=63
 */
function weaponSpecializationDamage(level: number, rank: ProficiencyRank): number {
  if (rank === "U" || rank === "T") return 0;
  if (level >= 15) {
    if (rank === "L") return 8;
    if (rank === "M") return 6;
    return 4;
  }
  if (level >= 7) {
    if (rank === "L") return 4;
    if (rank === "M") return 3;
    return 2;
  }
  return 0;
}

function usesPreciseStrike(strike: StrikeDefinition): boolean {
  return !strike.ranged && (strike.finesse === true || strike.agile === true);
}

function parseCritDice(critNote?: string): string | undefined {
  if (!critNote) return undefined;
  const match = critNote.match(/(\d+d\d+)/);
  return match?.[1];
}

function buildDamageProfile(
  strike: StrikeDefinition,
  snapshot: ProgressionSnapshot,
  rank: ProficiencyRank,
  strDamageDelta: number,
): StrikeDamageProfile {
  const strength = strike.ranged ? 0 : snapshot.attributes.STR + strDamageDelta;
  const flatBonus = strength + weaponSpecializationDamage(snapshot.level, rank);
  return {
    weaponDice: strike.dice,
    flatBonus,
    damageType: strike.damageType,
    preciseStrike: usesPreciseStrike(strike) ? snapshot.preciseStrike : 0,
    finisherDice: snapshot.finisherDice,
    critNote: strike.critNote,
    critDice: parseCritDice(strike.critNote),
  };
}

/**
 * Attack modifier = attribute + weapon proficiency + Tracking item bonus.
 * MAP: –5/–10, or –4/–8 with Agile.
 * @see https://2e.aonsrd.com/rules/336-attack-rolls
 * @see https://2e.aonsrd.com/traits/11-agile
 * @see https://2e.aonsrd.com/traits/183-tracking
 */
function attackBonus(strike: StrikeDefinition, snapshot: ProgressionSnapshot, rank: ProficiencyRank): number {
  const attribute = snapshot.attributes[attackAttribute(strike)];
  return attribute + proficiencyBonus(rank, snapshot.level) + strike.tracking;
}

/**
 * Melee: dice + Strength + specialization + Precise Strike.
 * Ranged: dice + specialization (no Strength unless thrown/propulsive).
 * @see https://2e.aonsrd.com/rules/349-damage-rolls
 */
function formatDamage(
  strike: StrikeDefinition,
  snapshot: ProgressionSnapshot,
  rank: ProficiencyRank,
  strDamageDelta = 0,
): string {
  const strength = strike.ranged ? 0 : snapshot.attributes.STR + strDamageDelta;
  const bonus = strength + weaponSpecializationDamage(snapshot.level, rank);
  let text = strike.dice;
  if (bonus !== 0) text += signed(bonus);
  text += ` ${strike.damageType}`;

  if (usesPreciseStrike(strike)) {
    text += ` ${signed(snapshot.preciseStrike)} precision`;
  }

  if (strike.expend != null) {
    text += ` (Expend ${strike.expend})`;
  }

  return text;
}

export function buildWeaponStrikes(
  snapshot: ProgressionSnapshot,
  extras: {
    attackDelta?: (strike: { ranged?: boolean; finesse?: boolean }) => number;
    strDamageDelta?: number;
  } = {},
): WeaponStrike[] {
  const rank = weaponRank(snapshot.level);
  const attackDelta = extras.attackDelta ?? (() => 0);
  const strDamageDelta = extras.strDamageDelta ?? 0;
  return SHIM_SHAM_STRIKES.map((strike) => {
    const first = attackBonus(strike, snapshot, rank) + attackDelta(strike);
    const agile = strike.agile === true;
    const mapAttacks = mapAttackValues(first, agile);
    const critSpecialization = hasCriticalSpecialization(rank)
      ? criticalSpecializationEffect(strike.weaponGroup, strike.tracking)
      : undefined;
    return {
    id: strike.id,
    name: strike.name,
    mapAttacks,
    damage: formatDamage(strike, snapshot, rank, strike.ranged ? 0 : strDamageDelta),
    damageProfile: buildDamageProfile(strike, snapshot, rank, strike.ranged ? 0 : strDamageDelta),
    critNote: strike.critNote,
    critSpecialization,
    traits: [...strike.traits],
    url: strike.url,
    weaponUrl: strike.weaponUrl,
    ranged: strike.ranged,
    rangeIncrement: strike.rangeIncrement,
  };
  });
}

function traitMatches(traits: string[], trait: string): boolean {
  const key = trait.toLowerCase();
  return traits.some((entry) => {
    const lower = entry.toLowerCase();
    return lower === key || lower.startsWith(`${key} `);
  });
}

/** Confident Finisher: agile, finesse, or unarmed weapons only. */
export function isFinisherEligibleStrike(weapon: WeaponStrike): boolean {
  return (
    traitMatches(weapon.traits, "agile") ||
    traitMatches(weapon.traits, "finesse") ||
    traitMatches(weapon.traits, "unarmed")
  );
}

export type StrikesWeaponFilter = "all" | "melee" | "finisher";

export function filterWeaponStrikes(
  weapons: WeaponStrike[],
  filter: StrikesWeaponFilter,
): WeaponStrike[] {
  switch (filter) {
    case "melee":
      return weapons.filter((weapon) => !weapon.ranged);
    case "finisher":
      return weapons.filter(isFinisherEligibleStrike);
    default:
      return weapons;
  }
}
