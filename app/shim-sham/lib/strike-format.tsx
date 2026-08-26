import type { StrikesWeaponFilter } from "@/lib/shim-sham/strikes";

export type StrikeDamageMode = "default" | "finisher";

export type StrikesOpenOptions = {
  damageMode: StrikeDamageMode;
  weaponFilter: StrikesWeaponFilter;
};

export const DEFAULT_STRIKES_OPEN: StrikesOpenOptions = {
  damageMode: "default",
  weaponFilter: "all",
};

const PRECISION_SUFFIX_RE = / [+-]\d+ precision$/;

export function formatStrikeDamage(
  damage: string,
  finisherDice: string,
  mode: StrikeDamageMode,
) {
  if (mode === "finisher") {
    const base = damage.replace(PRECISION_SUFFIX_RE, "");
    return (
      <>
        {base}
        <span className="speed-panache"> +{finisherDice} precision</span>
      </>
    );
  }

  return damage;
}
