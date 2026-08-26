import { NextResponse } from "next/server";
import { loadRuntimeState, saveRuntimeState, isKvConfigured } from "@/lib/kv";
import { buildCharacterSheet, normalizeRuntimeState } from "@/lib/shim-sham/static";
import { normalizeConditions } from "@/lib/shim-sham/conditions";
import { applyRecoveryCheck } from "@/lib/shim-sham/recovery-check";
import {
  adjustCurrentHpForDrainedChange,
  effectiveMaxHp,
  tickRestConditions,
} from "@/lib/shim-sham/condition-effects";
import { getLevelSnapshot, getNextLevelSnapshot } from "@/lib/shim-sham/progression";
import type { RuntimeState } from "@/lib/types";
import {
  FORCE_FIELD_DAILY_USES,
  FORCE_FIELD_MAX_HP,
  FORCE_FIELD_REGEN_PER_TURN,
} from "@/lib/shim-sham/static";

function normalizeRuntime(runtime: RuntimeState): RuntimeState {
  return normalizeRuntimeState(runtime);
}

function mergeClientRuntime(
  server: RuntimeState,
  body: Partial<RuntimeState> & { action?: string; delta?: number; d20?: number },
): RuntimeState {
  const { action: _action, delta: _delta, d20: _d20, ...patch } = body;
  return { ...server, ...patch };
}

export async function GET() {
  const runtime = await loadRuntimeState();
  const sheet = buildCharacterSheet(runtime);

  return NextResponse.json({
    sheet,
    kvConfigured: isKvConfigured(),
  });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<RuntimeState> & {
    action?: "rest" | "level-up" | "activate-force-field" | "deactivate-force-field" | "force-field-regen" | "hp-delta" | "recovery-check";
    delta?: number;
    d20?: number;
  };

  const previous = await loadRuntimeState();
  let runtime = mergeClientRuntime(previous, body);

  if (body.action === "rest") {
    const snapshot = getLevelSnapshot(runtime.level)!;
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
    const snapshot = getLevelSnapshot(runtime.level)!;
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
    const snapshot = getLevelSnapshot(runtime.level)!;
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
        currentHp: Math.max(
          0,
          Math.min(effectiveMaxHp(snapshot.maxHp, runtime.conditions, snapshot.level), startHp + body.delta),
        ),
      };
    }
  } else {
    const { action: _action, delta: _delta, ...runtimePatch } = body;
    runtime = { ...runtime, ...runtimePatch };
    if (typeof body.level === "number") {
      const snapshot = getLevelSnapshot(body.level);
      if (snapshot && body.currentHp === undefined) {
        runtime.currentHp = Math.min(runtime.currentHp, snapshot.maxHp);
      }
    }
  }

  if (!runtime.encounter) {
    runtime = {
      ...runtime,
      panache: false,
      accelerate: false,
      duelingParry: false,
      batonParry: false,
      cover: "none",
      preparedToAid: false,
      delayed: false,
      forceFieldActive: false,
      forceFieldHp: 0,
    };
  }

  if (previous.meyelRerollUsed && body.action !== "rest") {
    runtime.meyelRerollUsed = true;
  }

  runtime = normalizeRuntime(runtime);
  const snapshot = getLevelSnapshot(runtime.level)!;
  runtime.currentHp = adjustCurrentHpForDrainedChange(
    normalizeConditions(previous.conditions),
    runtime.conditions,
    runtime.currentHp,
    snapshot.level,
    snapshot.maxHp,
  );

  await saveRuntimeState(runtime);
  const sheet = buildCharacterSheet(runtime);

  return NextResponse.json({ sheet, kvConfigured: isKvConfigured() });
}
