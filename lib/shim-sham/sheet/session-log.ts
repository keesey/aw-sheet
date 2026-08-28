import { formatActiveCondition } from "@/lib/shim-sham/rules/conditions";
import {
  applyRecoveryCheck,
  formatRecoveryCheckLogLine,
} from "@/lib/shim-sham/rules/recovery-check";
import type { ActiveCondition, RuntimeState } from "@/lib/types";
import type { SheetPatch } from "@/lib/shim-sham/rules/patch";

type SessionLogContext = {
  maxHp: number;
};

function isActiveCondition(value: unknown): value is ActiveCondition {
  return !!value && typeof value === "object" && typeof (value as ActiveCondition).id === "string";
}

function parseConditions(value: unknown): ActiveCondition[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter(isActiveCondition);
}

function conditionValue(active: ActiveCondition | undefined): number | null {
  return active?.value ?? null;
}

function sessionLogLinesForConditionChanges(
  before: ActiveCondition[],
  after: ActiveCondition[],
): string[] {
  const beforeById = new Map(before.map((condition) => [condition.id, condition]));
  const afterById = new Map(after.map((condition) => [condition.id, condition]));
  const ids = new Set([...beforeById.keys(), ...afterById.keys()]);
  const lines: string[] = [];

  for (const id of [...ids].sort()) {
    const previous = beforeById.get(id);
    const next = afterById.get(id);

    if (!previous && next) {
      lines.push(`+ ${formatActiveCondition(next)}`);
      continue;
    }
    if (previous && !next) {
      lines.push(`- ${formatActiveCondition(previous)}`);
      continue;
    }
    if (previous && next && conditionValue(previous) !== conditionValue(next)) {
      lines.push(`${formatActiveCondition(previous)} → ${formatActiveCondition(next)}`);
    }
  }

  return lines;
}

export function sessionLogLineForSave(
  body: SheetPatch,
  runtime: RuntimeState,
  context: SessionLogContext,
): string | null {
  if (body.action === "rest") {
    return "REST (8 hours)";
  }

  const nextConditions = parseConditions(body.conditions);
  if (nextConditions) {
    const lines = sessionLogLinesForConditionChanges(runtime.conditions, nextConditions);
    if (lines.length > 0) {
      return lines.join("\n");
    }
  }

  if (body.encounter === true && !runtime.encounter) {
    return "ENCOUNTER";
  }
  if (body.encounter === false && runtime.encounter) {
    return "EXPLORATION";
  }
  if (body.encounter === false) {
    return null;
  }

  if (body.action === "hp-delta" && typeof body.delta === "number") {
    const delta = body.delta;
    if (delta === 0) return null;
    return delta < 0 ? `HP ${delta}` : `HP +${delta}`;
  }

  if (body.action === "recovery-check" && typeof body.d20 === "number") {
    const d20 = Math.floor(body.d20);
    if (d20 < 1 || d20 > 20) return null;
    try {
      const result = applyRecoveryCheck(runtime.conditions, runtime.currentHp, d20, runtime.level);
      return formatRecoveryCheckLogLine(result);
    } catch {
      return null;
    }
  }

  if (typeof body.credits === "number" && body.credits !== runtime.credits) {
    const delta = body.credits - runtime.credits;
    const formatted = Math.abs(delta).toLocaleString();
    return delta < 0 ? `Credits -${formatted}` : `Credits +${formatted}`;
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

  if (body.preparedToAid === true && !runtime.preparedToAid) {
    return "Prepare to Aid";
  }
  if (body.preparedToAid === false && runtime.preparedToAid) {
    return "Aid";
  }

  if (body.delayed === true && !runtime.delayed) {
    return "Delay";
  }
  if (body.delayed === false && runtime.delayed) {
    return "Return to Initiative Order";
  }

  if (body.duelingParry === true && !runtime.duelingParry) {
    return "Dueling Parry activated";
  }
  if (body.batonParry === true && !runtime.batonParry) {
    return "Baton Parry activated";
  }

  if (body.cover !== undefined) {
    const cover = body.cover;
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
