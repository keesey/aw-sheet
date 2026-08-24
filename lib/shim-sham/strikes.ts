import type { AbilityKey, LevelSnapshot, ProficiencyRank, WeaponStrike } from "@/lib/types";
import { proficiencyBonus, proficiencyRankAtLevel } from "@/lib/shim-sham/proficiency";

const AON = "https://2e.aonsrd.com";

type WeaponCategory = "simple" | "martial" | "unarmed";

type StrikeDefinition = {
  id: string;
  name: string;
  category: WeaponCategory;
  /** Ranged attacks always use Dex. Melee uses Str unless finesse. */
  ranged?: boolean;
  finesse?: boolean;
  agile?: boolean;
  /** Item bonus to attack from the Tracking trait (0 if none). */
  tracking: number;
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
    finesse: true,
    tracking: 0,
    dice: "1d6",
    damageType: "P",
    traits: ["Brawling", "Finesse", "Grapple", "Unarmed"],
    url: `${AON}/actions/15-strike`,
    weaponUrl: `${AON}/feats/331-predatory`,
  },
  {
    id: "rapier",
    name: "Nano-Edge Rapier (Advanced)",
    category: "martial",
    finesse: true,
    tracking: 1,
    dice: "2d6",
    damageType: "P",
    critNote: "+1d8 deadly on crit",
    traits: ["Sword", "Deadly d8", "Disarm", "Finesse"],
    url: `${AON}/actions/15-strike`,
    weaponUrl: `${AON}/equipment/weapons/17-nano-edge-rapier`,
  },
  {
    id: "tailblade",
    name: "Tailblade (Advanced)",
    category: "martial",
    finesse: true,
    agile: true,
    tracking: 1,
    dice: "2d4",
    damageType: "S",
    critNote: "frightened 1 on crit",
    traits: ["Knife", "Agile", "Finesse", "Free-hand"],
    url: `${AON}/actions/15-strike`,
    weaponUrl: `${AON}/equipment/weapons/29-tailblade`,
  },
  {
    id: "zero-knife",
    name: "Zero Knife",
    category: "simple",
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
    ranged: true,
    tracking: 1,
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

export function mapAttackValues(first: number, agile: boolean): [number, number, number] {
  const secondPenalty = agile ? 4 : 5;
  const thirdPenalty = agile ? 8 : 10;
  return [first, first - secondPenalty, first - thirdPenalty];
}

export function formatMapAttacks(first: number, agile: boolean): string {
  return mapAttackValues(first, agile).map(signed).join(" / ");
}

export function bestWeaponMapBonus(weapons: WeaponStrike[]): string | undefined {
  let bestValue = Number.NEGATIVE_INFINITY;
  let bestAgile = false;

  for (const weapon of weapons) {
    const value = weapon.mapAttacks[0];
    if (value <= bestValue) continue;
    bestValue = value;
    bestAgile = weapon.traits.includes("Agile");
  }

  if (!Number.isFinite(bestValue)) return undefined;
  return formatMapAttacks(bestValue, bestAgile);
}

export function formatSkillAttackMapBonus(bonus: string): string {
  const match = bonus.match(/^([+-]?\d+)/);
  if (!match) return bonus;
  return formatMapAttacks(parseInt(match[1], 10), false);
}

function attackAttribute(strike: StrikeDefinition): AbilityKey {
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

/**
 * Attack modifier = attribute + weapon proficiency + Tracking item bonus.
 * MAP: –5/–10, or –4/–8 with Agile.
 * @see https://2e.aonsrd.com/rules/336-attack-rolls
 * @see https://2e.aonsrd.com/traits/11-agile
 * @see https://2e.aonsrd.com/traits/183-tracking
 */
function attackBonus(strike: StrikeDefinition, snapshot: LevelSnapshot, rank: ProficiencyRank): number {
  const attribute = snapshot.abilities[attackAttribute(strike)];
  return attribute + proficiencyBonus(rank, snapshot.level) + strike.tracking;
}

/**
 * Melee: dice + Strength + specialization + Precise Strike.
 * Ranged: dice + specialization (no Strength unless thrown/propulsive).
 * @see https://2e.aonsrd.com/rules/349-damage-rolls
 */
function formatDamage(
  strike: StrikeDefinition,
  snapshot: LevelSnapshot,
  rank: ProficiencyRank,
  strDamageDelta = 0,
): string {
  const strength = strike.ranged ? 0 : snapshot.abilities.STR + strDamageDelta;
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
  snapshot: LevelSnapshot,
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
    return {
    id: strike.id,
    name: strike.name,
    attack: formatMapAttacks(first, agile),
    mapAttacks,
    damage: formatDamage(strike, snapshot, rank, strike.ranged ? 0 : strDamageDelta),
    critNote: strike.critNote,
    traits: [...strike.traits],
    url: strike.url,
    weaponUrl: strike.weaponUrl,
    ranged: strike.ranged,
  };
  });
}
