import type { CoverLevel, RuntimeState } from "@/lib/types";

function coverCircumstanceBonus(cover: CoverLevel): number {
  if (cover === "greater") return 4;
  if (cover === "standard") return 2;
  return 0;
}

/** Circumstance bonuses to AC do not stack; use the highest active bonus. */
export function circumstanceAcBonus(
  runtime: Pick<RuntimeState, "duelingParry" | "batonParry" | "cover">,
): number {
  return Math.max(
    0,
    runtime.duelingParry ? 2 : 0,
    runtime.batonParry ? 1 : 0,
    coverCircumstanceBonus(runtime.cover),
  );
}
