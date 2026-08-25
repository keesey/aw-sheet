import { PAHTRA_ANCESTRY_HP } from "@/lib/shim-sham/ancestry";
import { FEATS_BY_LEVEL } from "@/lib/shim-sham/feats";

/** Swashbuckler HP per level includes Constitution modifier each level. */
export const SWASHBUCKLER_HP_PER_LEVEL = 10;

function hasToughness(level: number): boolean {
  return FEATS_BY_LEVEL.some(
    (entry) =>
      entry.level <= level &&
      entry.entries.some((feat) => feat.name === "Toughness"),
  );
}

/**
 * Max HP = ancestry + level × (class HP + Con mod) + Toughness (level, from level 3).
 * @see https://2e.aonsrd.com/rules/58-hit-points
 * @see https://2e.aonsrd.com/feats/899-toughness
 */
export function maxHp(level: number, constitutionModifier: number): number {
  const fromClass = level * (SWASHBUCKLER_HP_PER_LEVEL + constitutionModifier);
  const fromToughness = hasToughness(level) ? level : 0;
  return PAHTRA_ANCESTRY_HP + fromClass + fromToughness;
}
