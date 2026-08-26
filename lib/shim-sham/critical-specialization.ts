import type { ProficiencyRank } from "@/lib/types";

/** Weapon groups Shim Sham uses; effects from https://2e.aonsrd.com/equipment/weapon-groups */
export type WeaponGroup =
  | "axe"
  | "brawling"
  | "club"
  | "corrosive"
  | "crossbow"
  | "cryo"
  | "dart"
  | "flail"
  | "flame"
  | "grenade"
  | "hammer"
  | "knife"
  | "laser"
  | "mental"
  | "plasma"
  | "polearm"
  | "projectile"
  | "shield"
  | "shock"
  | "sniper"
  | "sonic"
  | "spear"
  | "sword";

const CRIT_SPEC: Record<WeaponGroup, (tracking: number) => string> = {
  axe: () => "adjacent foe takes weapon dice damage (not doubled)",
  brawling: () => "slowed 1 until end of your next turn (Fort vs. class DC)",
  club: () => "knock target up to 10 ft. away",
  corrosive: (tracking) =>
    tracking > 0
      ? `1d6 persistent acid (+${tracking} item bonus to acid)`
      : "1d6 persistent acid",
  crossbow: (tracking) =>
    tracking > 0
      ? `1d8 persistent bleed (+${tracking} item bonus to bleed)`
      : "1d8 persistent bleed",
  cryo: () => "clumsy 1 until your next turn",
  dart: (tracking) =>
    tracking > 0
      ? `1d6 persistent bleed (+${tracking} item bonus to bleed)`
      : "1d6 persistent bleed",
  flail: () => "knock prone (Ref vs. class DC)",
  flame: (tracking) =>
    tracking > 0
      ? `1d6 persistent fire (+${tracking} item bonus to fire)`
      : "1d6 persistent fire",
  grenade: () => "varies by grenade",
  hammer: () => "knock prone (Fort vs. class DC)",
  knife: (tracking) =>
    tracking > 0
      ? `1d6 persistent bleed (+${tracking} item bonus to bleed)`
      : "1d6 persistent bleed",
  laser: () => "dazzled until your next turn (Fort vs. class DC)",
  mental: () => "stupefied 1 until your next turn (Will vs. class DC)",
  plasma: (tracking) =>
    tracking > 0
      ? `1d6 persistent electricity (+${tracking} item bonus to electricity)`
      : "1d6 persistent electricity",
  polearm: () => "move target 5 ft. (forced movement)",
  projectile: () => "slowed 1 until your next turn (Fort vs. class DC)",
  shield: () => "knock target 5 ft. away",
  shock: () => "stunned 1 (Fort vs. class DC)",
  sniper: () => "+2 damage per weapon damage die",
  sonic: () => "deafened 1 minute (Fort vs. class DC)",
  spear: () => "clumsy 1 until your next turn",
  sword: () => "off-guard until your next turn",
};

/** Swashbuckler Weapon Expertise (5+) grants crit spec for expert+ weapons. */
export function hasCriticalSpecialization(rank: ProficiencyRank): boolean {
  return rank !== "U" && rank !== "T";
}

export function criticalSpecializationEffect(
  group: WeaponGroup,
  tracking = 0,
): string {
  return CRIT_SPEC[group](tracking);
}
