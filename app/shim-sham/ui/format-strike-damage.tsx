import type { StrikeDamageMode } from "@/lib/shim-sham/rules/strike-open-options";

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
