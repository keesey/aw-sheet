import type { ActiveCondition, CharacterAction, CoverLevel } from "@/lib/types";
import { getActiveCondition } from "@/lib/shim-sham/conditions";

export function actionEndsCover(action: Pick<CharacterAction, "traits">): boolean {
  const traits = action.traits ?? [];
  return traits.includes("Attack") || traits.includes("Finisher");
}

/** Unconscious or dying (which implies unconscious). */
export function isEffectivelyUnconscious(conditions: ActiveCondition[]): boolean {
  return (
    getActiveCondition(conditions, "unconscious") != null ||
    getActiveCondition(conditions, "dying") != null
  );
}

export function shouldClearCoverForUnconscious(
  previous: ActiveCondition[],
  next: ActiveCondition[],
  cover: CoverLevel,
): boolean {
  if (cover === "none") return false;
  return isEffectivelyUnconscious(next) && !isEffectivelyUnconscious(previous);
}
