import { NextResponse } from "next/server";
import { loadRuntimeState, saveRuntimeState, isKvConfigured } from "@/lib/kv";
import { buildCharacterSheet } from "@/lib/shim-sham/static";
import { getLevelSnapshot, getNextLevelSnapshot } from "@/lib/shim-sham/progression";
import type { RuntimeState } from "@/lib/types";
import {
  FORCE_FIELD_DAILY_USES,
  FORCE_FIELD_MAX_HP,
} from "@/lib/shim-sham/static";

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

  let runtime = await loadRuntimeState();

  if (body.action === "rest") {
    const snapshot = getLevelSnapshot(runtime.level)!;
    const conMod = Math.max(1, snapshot.abilities.CON);
    const heal = conMod * runtime.level;
    runtime = {
      ...runtime,
      currentHp: Math.min(snapshot.maxHp, runtime.currentHp + heal),
      forceFieldUsesUsed: 0,
      forceFieldHp: 0,
      meyelRerollUsed: false,
      panache: false,
      conditions: runtime.conditions.filter((c) => c !== "fatigued"),
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
    let remaining = body.delta;

    if (remaining < 0) {
      const damage = Math.abs(remaining);
      if (runtime.forceFieldHp > 0) {
        const absorbed = Math.min(runtime.forceFieldHp, damage);
        runtime.forceFieldHp -= absorbed;
        remaining = -(damage - absorbed);
      }
      if (remaining < 0) {
        runtime.currentHp = Math.max(0, runtime.currentHp + remaining);
      }
    } else {
      runtime.currentHp = Math.min(snapshot.maxHp, runtime.currentHp + remaining);
    }
  } else {
    runtime = { ...runtime, ...body };
    if (typeof body.level === "number") {
      const snapshot = getLevelSnapshot(body.level);
      if (snapshot && body.currentHp === undefined) {
        runtime.currentHp = Math.min(runtime.currentHp, snapshot.maxHp);
      }
    }
  }

  await saveRuntimeState(runtime);
  const sheet = buildCharacterSheet(runtime);

  return NextResponse.json({ sheet, kvConfigured: isKvConfigured() });
}
