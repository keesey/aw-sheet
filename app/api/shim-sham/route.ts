import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/shim-sham/auth";
import { loadRuntimeState, saveRuntimeState, isKvConfigured } from "@/lib/kv";
import { buildCharacterSheet, normalizeRuntimeState } from "@/lib/shim-sham/static";
import { normalizeConditions } from "@/lib/shim-sham/conditions";
import { applyRecoveryCheck } from "@/lib/shim-sham/recovery-check";
import { shouldClearCoverForUnconscious } from "@/lib/shim-sham/cover";
import {
  adjustCurrentHpForDrainedChange,
  effectiveMaxHp,
  tickRestConditions,
} from "@/lib/shim-sham/condition-effects";
import { getNextLevelSnapshot, requireLevelSnapshot } from "@/lib/shim-sham/progression";
import { MAX_REQUEST_BODY_BYTES, parseSheetPatch, stripLocalBaseRuntime, extractLocalBaseRuntime } from "@/lib/shim-sham/patch";
import {
  pickCompanionPatchFields,
  pickDirectPatchFields,
  validatePatchBody,
} from "@/lib/shim-sham/patch-security";
import { applyEncounterOffReset } from "@/lib/shim-sham/runtime-reset";
import type { RuntimeState } from "@/lib/types";
import {
  FORCE_FIELD_DAILY_USES,
  FORCE_FIELD_MAX_HP,
  FORCE_FIELD_REGEN_PER_TURN,
} from "@/lib/shim-sham/static";

function normalizeRuntime(runtime: RuntimeState): RuntimeState {
  return normalizeRuntimeState(runtime);
}

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

async function readJsonBody(request: Request): Promise<unknown | NextResponse> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number.parseInt(contentLength, 10) > MAX_REQUEST_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  try {
    return await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const runtime = await loadRuntimeState();
  const sheet = buildCharacterSheet(runtime);

  return NextResponse.json({
    sheet,
    kvConfigured: isKvConfigured(),
  });
}

export async function PATCH(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  const rawBody = await readJsonBody(request);
  if (rawBody instanceof NextResponse) {
    return rawBody;
  }

  if (isKvConfigured() && extractLocalBaseRuntime(rawBody)) {
    return NextResponse.json({ error: "Unexpected _baseRuntime" }, { status: 400 });
  }

  const body = parseSheetPatch(stripLocalBaseRuntime(rawBody));
  if (!body) {
    return NextResponse.json({ error: "Invalid patch body" }, { status: 400 });
  }

  const violation = validatePatchBody(body);
  if (violation) {
    return NextResponse.json({ error: violation }, { status: 400 });
  }

  const previous = extractLocalBaseRuntime(rawBody) ?? (await loadRuntimeState());
  let runtime: RuntimeState = { ...previous };

  try {
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
        return NextResponse.json({ error: "Already at max planned level" }, { status: 400 });
      }
      runtime = {
        ...runtime,
        level: next.level,
        currentHp: next.maxHp,
      };
    } else if (body.action === "activate-force-field") {
      if (runtime.forceFieldUsesUsed >= FORCE_FIELD_DAILY_USES) {
        return NextResponse.json({ error: "No Force Field uses remaining" }, { status: 400 });
      }
      if (runtime.forceFieldActive) {
        return NextResponse.json({ error: "Force Field is already active" }, { status: 400 });
      }
      runtime = {
        ...runtime,
        forceFieldActive: true,
        forceFieldUsesUsed: runtime.forceFieldUsesUsed + 1,
        forceFieldHp: FORCE_FIELD_MAX_HP,
      };
    } else if (body.action === "deactivate-force-field") {
      if (!runtime.forceFieldActive) {
        return NextResponse.json({ error: "Force Field is not active" }, { status: 400 });
      }
      runtime = {
        ...runtime,
        forceFieldActive: false,
        forceFieldHp: 0,
      };
    } else if (body.action === "force-field-regen") {
      if (!runtime.forceFieldActive) {
        return NextResponse.json({ error: "Force Field is not active" }, { status: 400 });
      }
      if (runtime.forceFieldHp >= FORCE_FIELD_MAX_HP) {
        return NextResponse.json({ error: "Force Field is at full temp HP" }, { status: 400 });
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
        return NextResponse.json({ error: "Recovery check d20 must be between 1 and 20" }, { status: 400 });
      }
      const conditions = normalizeConditions(runtime.conditions);
      if (!conditions.some((condition) => condition.id === "dying")) {
        return NextResponse.json({ error: "Not dying" }, { status: 400 });
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
      return NextResponse.json({ error: "Invalid action payload" }, { status: 400 });
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

    runtime = normalizeRuntime(runtime);
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
  } catch {
    return NextResponse.json({ error: "Invalid runtime state" }, { status: 400 });
  }

  await saveRuntimeState(runtime);
  const sheet = buildCharacterSheet(runtime);

  return NextResponse.json({ sheet, kvConfigured: isKvConfigured() });
}
