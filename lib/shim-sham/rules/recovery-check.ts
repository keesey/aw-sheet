import type { ActiveCondition } from "@/lib/types";
import {
  adjustConditionValue,
  getActiveCondition,
  removeCondition,
} from "@/lib/shim-sham/rules/conditions";
import { hasToughness } from "@/lib/shim-sham/rules/max-hp";

export type RecoveryOutcome =
  | "critical-success"
  | "success"
  | "failure"
  | "critical-failure";

export function recoveryCheckDc(dyingValue: number, toughness: boolean): number {
  return 10 + dyingValue - (toughness ? 1 : 0);
}

export function evaluateRecoveryFlatCheck(d20: number, dc: number): RecoveryOutcome {
  if (d20 === 20) return "critical-success";
  if (d20 === 1) return "critical-failure";
  if (d20 >= dc) return "success";
  return "failure";
}

export function recoveryOutcomeLabel(outcome: RecoveryOutcome): string {
  switch (outcome) {
    case "critical-success":
      return "Critical success";
    case "success":
      return "Success";
    case "failure":
      return "Failure";
    case "critical-failure":
      return "Critical failure";
  }
}

export function dyingMaxFromDoomed(doomedValue: number): number {
  return Math.max(0, 4 - doomedValue);
}

function conditionValue(conditions: ActiveCondition[], id: string): number {
  return getActiveCondition(conditions, id)?.value ?? 0;
}

function dyingDeltaForOutcome(outcome: RecoveryOutcome): number {
  switch (outcome) {
    case "critical-success":
      return -2;
    case "success":
      return -1;
    case "failure":
      return 1;
    case "critical-failure":
      return 2;
  }
}

function applyWoundedIncrease(conditions: ActiveCondition[]): ActiveCondition[] {
  const wounded = getActiveCondition(conditions, "wounded");
  if (!wounded) {
    return [...conditions, { id: "wounded", value: 1 }];
  }
  return adjustConditionValue(conditions, "wounded", 1);
}

function clearDeathConditions(conditions: ActiveCondition[]): ActiveCondition[] {
  return removeCondition(
    removeCondition(removeCondition(conditions, "dying"), "doomed"),
    "unconscious",
  );
}

export type RecoveryCheckResult = {
  conditions: ActiveCondition[];
  currentHp: number;
  died: boolean;
  outcome: RecoveryOutcome;
  dc: number;
  d20: number;
  previousDying: number;
  nextDying: number | null;
};

/** Apply a recovery check flat roll (d20 vs DC). @see https://2e.aonsrd.com/rules/374-recovery-checks */
export function applyRecoveryCheck(
  conditions: ActiveCondition[],
  currentHp: number,
  d20: number,
  characterLevel: number,
): RecoveryCheckResult {
  const dyingActive = getActiveCondition(conditions, "dying");
  if (!dyingActive) {
    throw new Error("Not dying");
  }

  const previousDying = dyingActive.value ?? 1;
  const doomed = conditionValue(conditions, "doomed");
  const dyingMax = dyingMaxFromDoomed(doomed);
  const toughness = hasToughness(characterLevel);
  const dc = recoveryCheckDc(previousDying, toughness);
  const outcome = evaluateRecoveryFlatCheck(d20, dc);
  const delta = dyingDeltaForOutcome(outcome);
  const nextDying = previousDying + delta;

  if (dyingMax === 0 || nextDying >= dyingMax) {
    return {
      conditions: clearDeathConditions(conditions),
      currentHp,
      died: true,
      outcome,
      dc,
      d20,
      previousDying,
      nextDying: null,
    };
  }

  if (nextDying <= 0) {
    let nextConditions = removeCondition(conditions, "dying");
    nextConditions = applyWoundedIncrease(nextConditions);
    if (currentHp <= 0 && !getActiveCondition(nextConditions, "unconscious")) {
      nextConditions = [...nextConditions, { id: "unconscious" }];
    }
    return {
      conditions: nextConditions,
      currentHp,
      died: false,
      outcome,
      dc,
      d20,
      previousDying,
      nextDying: 0,
    };
  }

  return {
    conditions: adjustConditionValue(conditions, "dying", delta),
    currentHp,
    died: false,
    outcome,
    dc,
    d20,
    previousDying,
    nextDying,
  };
}

export function formatRecoveryCheckLogLine(result: RecoveryCheckResult): string {
  const outcome = recoveryOutcomeLabel(result.outcome);
  if (result.died) {
    return `Recovery check: ${result.d20} vs DC ${result.dc} — ${outcome} (Dying ${result.previousDying} — death)`;
  }
  if (result.nextDying === 0) {
    return `Recovery check: ${result.d20} vs DC ${result.dc} — ${outcome} (Dying ${result.previousDying} → 0, Wounded +1)`;
  }
  return `Recovery check: ${result.d20} vs DC ${result.dc} — ${outcome} (Dying ${result.previousDying} → ${result.nextDying})`;
}

export function recoveryCheckContext(
  conditions: ActiveCondition[],
  characterLevel: number,
) {
  const dying = getActiveCondition(conditions, "dying");
  const dyingValue = dying?.value ?? 1;
  const doomedValue = conditionValue(conditions, "doomed");
  const woundedValue = conditionValue(conditions, "wounded");
  const toughness = hasToughness(characterLevel);
  const dyingMax = dyingMaxFromDoomed(doomedValue);
  const dc = recoveryCheckDc(dyingValue, toughness);

  return {
    dyingValue,
    doomedValue,
    woundedValue,
    dyingMax,
    dc,
    toughness,
  };
}
