import type { RuntimeState } from "@/lib/types";
import type { SheetPatch, SheetPatchAction } from "@/lib/shim-sham/patch";

/** Fields the client may set directly or alongside an action. */
export const DIRECT_PATCH_FIELDS = new Set<keyof RuntimeState>([
  "panache",
  "accelerate",
  "jetpack",
  "encounter",
  "duelingParry",
  "batonParry",
  "cover",
  "preparedToAid",
  "delayed",
  "credits",
  "conditions",
  "consumables",
  "batteries",
  "chemTankCharges",
  "adHocItems",
  "notes",
  "currentHp",
  "meyelRerollUsed",
]);

/** Fields only mutated by named server actions, never accepted from the client. */
const SERVER_OWNED_FIELDS = new Set<keyof RuntimeState>([
  "level",
  "forceFieldUsesUsed",
  "forceFieldActive",
]);

const ACTION_INPUT_FIELDS = new Set(["delta", "d20", "currentHp", "forceFieldHp", "conditions"]);

/** Action inputs and companion fields must not be auto-merged before the handler runs. */
const ACTION_INPUT_ONLY = new Set(["currentHp", "forceFieldHp", "conditions"]);

const ACTION_ALLOWED_INPUTS: Record<SheetPatchAction, ReadonlySet<string>> = {
  rest: new Set(["currentHp", "conditions"]),
  "level-up": new Set(),
  "activate-force-field": new Set(),
  "deactivate-force-field": new Set(),
  "force-field-regen": new Set(),
  "hp-delta": new Set(["delta", "currentHp", "forceFieldHp"]),
  "recovery-check": new Set(["d20"]),
};

function patchKeys(body: SheetPatch): string[] {
  return Object.keys(body).filter(
    (key) => key !== "action" && body[key as keyof SheetPatch] !== undefined,
  );
}

export function validatePatchBody(body: SheetPatch): string | null {
  if (body.meyelRerollUsed === false) {
    return "meyelRerollUsed cannot be cleared except via rest";
  }

  for (const key of patchKeys(body)) {
    if (SERVER_OWNED_FIELDS.has(key as keyof RuntimeState)) {
      return `Field "${key}" cannot be patched directly`;
    }
  }

  if (body.action) {
    const allowedInputs = ACTION_ALLOWED_INPUTS[body.action];
    for (const key of patchKeys(body)) {
      if (DIRECT_PATCH_FIELDS.has(key as keyof RuntimeState)) continue;
      if (allowedInputs.has(key)) continue;
      if (ACTION_INPUT_FIELDS.has(key)) {
        return `Field "${key}" is not allowed with action "${body.action}"`;
      }
      return `Unknown or disallowed patch field "${key}"`;
    }
    return null;
  }

  for (const key of patchKeys(body)) {
    if (!DIRECT_PATCH_FIELDS.has(key as keyof RuntimeState)) {
      if (ACTION_INPUT_FIELDS.has(key)) {
        return `Field "${key}" requires a named action`;
      }
      return `Unknown or disallowed patch field "${key}"`;
    }
  }

  return null;
}

function pickFields(
  patch: SheetPatch,
  skipActionInputs: boolean,
): Partial<RuntimeState> {
  const result: Partial<RuntimeState> = {};
  for (const key of DIRECT_PATCH_FIELDS) {
    if (skipActionInputs && ACTION_INPUT_ONLY.has(key)) continue;
    if (patch[key] === undefined) continue;
    if (key === "meyelRerollUsed" && patch.meyelRerollUsed !== true) continue;
    result[key] = patch[key] as never;
  }
  return result;
}

/** Merge allowed client fields when no action is present. */
export function pickDirectPatchFields(patch: SheetPatch): Partial<RuntimeState> {
  return pickFields(patch, false);
}

/** Merge safe companion fields alongside a named action. */
export function pickCompanionPatchFields(patch: SheetPatch): Partial<RuntimeState> {
  return pickFields(patch, true);
}
