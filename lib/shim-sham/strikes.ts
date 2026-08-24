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
  damage: string;
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
    damage: "1d6+2 B +3 precision (+3d6 finisher)",
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
    damage: "1d4+2 S +3 precision (+3d6 finisher)",
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
    damage: "1d6+2 P +3 precision (+3d6 finisher)",
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
    damage: "2d6+2 P +3 precision (+3d6 finisher, +1d8 deadly on crit)",
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
    damage: "2d4+2 S +3 precision (+3d6 finisher; frightened 1 on crit)",
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
    damage: "1d4+2 C/P +3 precision (+3d6 finisher)",
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
    damage: "2d6 C (Expend 2)",
    traits: ["Tech"],
    url: `${AON}/actions/15-strike`,
    weaponUrl: `${AON}/equipment/weapons/48-zero-pistol`,
  },
];

function signed(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function attackAttribute(strike: StrikeDefinition): AbilityKey {
  if (strike.ranged || strike.finesse) return "DEX";
  return "STR";
}

/**
 * Attack modifier = attribute + weapon proficiency + Tracking item bonus.
 * MAP: –5/–10, or –4/–8 with Agile.
 * @see https://2e.aonsrd.com/rules/336-attack-rolls
 * @see https://2e.aonsrd.com/traits/11-agile
 * @see https://2e.aonsrd.com/traits/183-tracking
 */
function attackBonus(strike: StrikeDefinition, snapshot: LevelSnapshot): number {
  const rank = proficiencyRankAtLevel(WEAPON_RANKS, snapshot.level);
  const attribute = snapshot.abilities[attackAttribute(strike)];
  return attribute + proficiencyBonus(rank, snapshot.level) + strike.tracking;
}

function formatMapAttacks(first: number, agile: boolean): string {
  const secondPenalty = agile ? 4 : 5;
  const thirdPenalty = agile ? 8 : 10;
  return [first, first - secondPenalty, first - thirdPenalty].map(signed).join(" / ");
}

export function buildWeaponStrikes(snapshot: LevelSnapshot): WeaponStrike[] {
  return SHIM_SHAM_STRIKES.map((strike) => ({
    id: strike.id,
    name: strike.name,
    attack: formatMapAttacks(attackBonus(strike, snapshot), strike.agile === true),
    damage: strike.damage,
    traits: [...strike.traits],
    url: strike.url,
    weaponUrl: strike.weaponUrl,
  }));
}
