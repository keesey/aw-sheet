import { NextResponse } from "next/server";
import { loadRuntimeState, saveRuntimeState, isKvConfigured } from "@/lib/kv";
import { buildCharacterSheet, normalizeRuntimeState } from "@/lib/shim-sham/static";
import { normalizeConditions } from "@/lib/shim-sham/conditions";
import { getLevelSnapshot, getNextLevelSnapshot } from "@/lib/shim-sham/progression";
import type { RuntimeState } from "@/lib/types";
import {
  FORCE_FIELD_DAILY_USES,
  FORCE_FIELD_MAX_HP,
} from "@/lib/shim-sham/static";

function normalizeRuntime(runtime: RuntimeState): RuntimeState {
  return normalizeRuntimeState(runtime);
}

function mergeClientRuntime(
  server: RuntimeState,
  body: Partial<RuntimeState> & { action?: string; delta?: number },
): RuntimeState {
  const { action: _action, delta: _delta, ...patch } = body;
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
    action?: "rest" | "level-up" | "activate-force-field" | "deactivate-force-field" | "force-field-regen" | "hp-delta";
    delta?: number;
  };

  let runtime = mergeClientRuntime(await loadRuntimeState(), body);

  if (body.action === "rest") {
    const snapshot = getLevelSnapshot(runtime.level)!;
    const conMod = Math.max(1, snapshot.abilities.CON);
    const heal = conMod * runtime.level;
    const startHp = typeof body.currentHp === "number" ? body.currentHp : runtime.currentHp;
    const conditions = Array.isArray(body.conditions) ? body.conditions : runtime.conditions;
    runtime = {
      ...runtime,
      currentHp: Math.min(snapshot.maxHp, startHp + heal),
      forceFieldUsesUsed: 0,
      forceFieldHp: 0,
      meyelRerollUsed: false,
      panache: false,
      accelerate: false,
      jetpack: false,
      combat: false,
      conditions: normalizeConditions(conditions).filter((c) => c.id !== "fatigued"),
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
    runtime = {
      ...runtime,
      forceFieldUsesUsed: runtime.forceFieldUsesUsed + 1,
      forceFieldHp: FORCE_FIELD_MAX_HP,
    };
  } else if (body.action === "deactivate-force-field") {
    runtime = {
      ...runtime,
      forceFieldHp: 0,
    };
  } else if (body.action === "force-field-regen") {
    runtime = {
      ...runtime,
      forceFieldHp: Math.min(FORCE_FIELD_MAX_HP, runtime.forceFieldHp + 2),
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
        currentHp,
      };
    } else if (body.delta > 0) {
      runtime = {
        ...runtime,
        currentHp: Math.max(0, Math.min(snapshot.maxHp, startHp + body.delta)),
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

  if (!runtime.combat) {
    runtime.panache = false;
  }

  runtime = normalizeRuntime(runtime);

  await saveRuntimeState(runtime);
  const sheet = buildCharacterSheet(runtime);

  return NextResponse.json({ sheet, kvConfigured: isKvConfigured() });
}
