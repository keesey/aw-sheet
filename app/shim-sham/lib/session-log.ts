import type { CoverLevel, RuntimeState } from "@/lib/types";

type SessionLogContext = {
  maxHp: number;
};

export function sessionLogLineForSave(
  body: Record<string, unknown>,
  runtime: RuntimeState,
  context: SessionLogContext,
): string | null {
  if (body.action === "rest") {
    return "REST (8 hours)";
  }

  if (body.combat === true && !runtime.combat) {
    return "ENCOUNTER";
  }
  if (body.combat === false && runtime.combat) {
    return "EXPLORATION";
  }
  if (body.combat === false) {
    return null;
  }

  if (body.action === "hp-delta" && typeof body.delta === "number") {
    const delta = body.delta;
    if (delta === 0) return null;
    return delta < 0 ? `HP ${delta}` : `HP +${delta}`;
  }

  if (typeof body.currentHp === "number" && body.currentHp === context.maxHp) {
    return `HP restored to ${context.maxHp}`;
  }

  if (body.action === "activate-force-field") {
    return "Force Field activated";
  }
  if (body.action === "deactivate-force-field") {
    return "Force Field deactivated";
  }

  if (body.accelerate === true && !runtime.accelerate) {
    return "Cardiac Accelerator activated";
  }
  if (body.accelerate === false && runtime.accelerate) {
    return "Cardiac Accelerator deactivated";
  }

  if (body.jetpack === true && !runtime.jetpack) {
    return "Jetpack activated";
  }
  if (body.jetpack === false && runtime.jetpack) {
    return "Jetpack deactivated";
  }

  if (body.meyelRerollUsed === true && !runtime.meyelRerollUsed) {
    return "Reroll Save — Meyel's Chosen Pahtra";
  }

  if (body.duelingParry === true && !runtime.duelingParry) {
    return "Dueling Parry activated";
  }
  if (body.batonParry === true && !runtime.batonParry) {
    return "Baton Parry activated";
  }

  if (typeof body.cover === "string") {
    const cover = body.cover as CoverLevel;
    if (cover === "standard" && runtime.cover !== "standard") {
      return "Take Cover (+2)";
    }
    if (cover === "greater" && runtime.cover !== "greater") {
      return "Take Cover (+4)";
    }
  }

  return null;
}

export function appendSessionLogLine(existing: string, line: string): string {
  return existing ? `${existing}\n${line}` : line;
}
