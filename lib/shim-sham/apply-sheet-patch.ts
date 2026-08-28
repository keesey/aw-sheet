import { normalizeConditions } from "@/lib/shim-sham/conditions";
import { applyRecoveryCheck } from "@/lib/shim-sham/recovery-check";
import { shouldClearCoverForUnconscious } from "@/lib/shim-sham/cover";
import {
  adjustCurrentHpForDrainedChange,
  effectiveMaxHp,
  tickRestConditions,
} from "@/lib/shim-sham/condition-effects";
import { getNextLevelSnapshot, requireLevelSnapshot } from "@/lib/shim-sham/progression";
import type { SheetPatch } from "@/lib/shim-sham/patch";
import {
  pickCompanionPatchFields,
  pickDirectPatchFields,
} from "@/lib/shim-sham/patch-security";
import { applyEncounterOffReset } from "@/lib/shim-sham/runtime-reset";
import type { RuntimeState } from "@/lib/types";
import {
  FORCE_FIELD_DAILY_USES,
  FORCE_FIELD_MAX_HP,
  FORCE_FIELD_REGEN_PER_TURN,
  normalizeRuntimeState,
} from "@/lib/shim-sham/static";

function clampCurrentHp(
  runtime: RuntimeState,
  currentHp: number,
  snapshotMaxHp: number,
): number {
  return Math.max(
    0,
    Math.min(effectiveMaxHp(snapshotMaxHp, runtime.conditions, runtime.level), currentHp),
  );
}

export class SheetPatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SheetPatchError";
  }
}

/** Apply a validated patch to a runtime snapshot; does not persist. */
export function applySheetPatch(previous: RuntimeState, body: SheetPatch): RuntimeState {
  let runtime: RuntimeState = { ...previous };

  if (body.action) {
    runtime = { ...runtime, ...pickCompanionPatchFields(body) };
  } else {
    runtime = { ...runtime, ...pickDirectPatchFields(body) };
  }

  if (body.action === "rest") {
    const snapshot = requireLevelSnapshot(runtime.level);
    const conMod = Math.max(1, snapshot.attributes.CON);
    const heal = conMod * runtime.level;
    const startHp = typeof body.currentHp === "number" ? body.currentHp : runtime.currentHp;
    const incoming = Array.isArray(body.conditions) ? body.conditions : runtime.conditions;
    const conditions = tickRestConditions(normalizeConditions(incoming));
    runtime = {
      ...runtime,
      currentHp: Math.min(effectiveMaxHp(snapshot.maxHp, conditions, snapshot.level), startHp + heal),
      forceFieldUsesUsed: 0,
      forceFieldHp: 0,
      forceFieldActive: false,
      meyelRerollUsed: false,
      panache: false,
      accelerate: false,
      jetpack: false,
      preparedToAid: false,
      delayed: false,
      encounter: false,
      conditions,
    };
  } else if (body.action === "level-up") {
    const next = getNextLevelSnapshot(runtime.level);
    if (!next) {
      throw new SheetPatchError("Already at max planned level");
    }
    runtime = {
      ...runtime,
      level: next.level,
      currentHp: next.maxHp,
    };
  } else if (body.action === "activate-force-field") {
    if (runtime.forceFieldUsesUsed >= FORCE_FIELD_DAILY_USES) {
      throw new SheetPatchError("No Force Field uses remaining");
    }
    if (runtime.forceFieldActive) {
      throw new SheetPatchError("Force Field is already active");
    }
    runtime = {
      ...runtime,
      forceFieldActive: true,
      forceFieldUsesUsed: runtime.forceFieldUsesUsed + 1,
      forceFieldHp: FORCE_FIELD_MAX_HP,
    };
  } else if (body.action === "deactivate-force-field") {
    if (!runtime.forceFieldActive) {
      throw new SheetPatchError("Force Field is not active");
    }
    runtime = {
      ...runtime,
      forceFieldActive: false,
      forceFieldHp: 0,
    };
  } else if (body.action === "force-field-regen") {
    if (!runtime.forceFieldActive) {
      throw new SheetPatchError("Force Field is not active");
    }
    if (runtime.forceFieldHp >= FORCE_FIELD_MAX_HP) {
      throw new SheetPatchError("Force Field is at full temp HP");
    }
    runtime = {
      ...runtime,
      forceFieldHp: Math.min(
        FORCE_FIELD_MAX_HP,
        runtime.forceFieldHp + FORCE_FIELD_REGEN_PER_TURN,
      ),
    };
  } else if (body.action === "recovery-check" && typeof body.d20 === "number") {
    const snapshot = requireLevelSnapshot(runtime.level);
    const d20 = Math.floor(body.d20);
    if (d20 < 1 || d20 > 20) {
      throw new SheetPatchError("Recovery check d20 must be between 1 and 20");
    }
    const conditions = normalizeConditions(runtime.conditions);
    if (!conditions.some((condition) => condition.id === "dying")) {
      throw new SheetPatchError("Not dying");
    }
    const result = applyRecoveryCheck(conditions, runtime.currentHp, d20, snapshot.level);
    runtime = {
      ...runtime,
      conditions: result.conditions,
      currentHp: result.currentHp,
    };
  } else if (body.action === "hp-delta" && typeof body.delta === "number") {
    const snapshot = requireLevelSnapshot(runtime.level);
    const startHp = typeof body.currentHp === "number" ? body.currentHp : runtime.currentHp;
    const startForceFieldHp =
      typeof body.forceFieldHp === "number" ? body.forceFieldHp : runtime.forceFieldHp;

    if (body.delta < 0) {
      let remaining = Math.abs(body.delta);
      let forceFieldHp = startForceFieldHp;
      let currentHp = startHp;

      if (forceFieldHp > 0) {
        const absorbed = Math.min(forceFieldHp, remaining);
        forceFieldHp -= absorbed;
        remaining -= absorbed;
      }
      if (remaining > 0) {
        currentHp = Math.max(0, currentHp - remaining);
      }

      runtime = {
        ...runtime,
        forceFieldHp,
        forceFieldActive: forceFieldHp > 0 && runtime.forceFieldActive,
        currentHp,
      };
    } else if (body.delta > 0) {
      runtime = {
        ...runtime,
        currentHp: clampCurrentHp(runtime, startHp + body.delta, snapshot.maxHp),
      };
    }
  } else if (body.action) {
    throw new SheetPatchError("Invalid action payload");
  } else if (typeof body.currentHp === "number") {
    const snapshot = requireLevelSnapshot(runtime.level);
    runtime = {
      ...runtime,
      currentHp: clampCurrentHp(runtime, body.currentHp, snapshot.maxHp),
    };
  }

  runtime = applyEncounterOffReset(runtime);

  if (previous.meyelRerollUsed && body.action !== "rest") {
    runtime.meyelRerollUsed = true;
  }

  runtime = normalizeRuntimeState(runtime);
  const snapshot = requireLevelSnapshot(runtime.level);
  if (
    shouldClearCoverForUnconscious(
      normalizeConditions(previous.conditions),
      runtime.conditions,
      runtime.cover,
    )
  ) {
    runtime = { ...runtime, cover: "none" };
  }
  runtime.currentHp = adjustCurrentHpForDrainedChange(
    normalizeConditions(previous.conditions),
    runtime.conditions,
    runtime.currentHp,
    snapshot.level,
    snapshot.maxHp,
  );

  return runtime;
}
