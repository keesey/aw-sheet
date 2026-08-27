import type { RuntimeState } from "@/lib/types";

/** Combat toggles cleared when leaving encounter mode (exploration). */
export function explorationResetFields(): Pick<
  RuntimeState,
  | "panache"
  | "accelerate"
  | "duelingParry"
  | "batonParry"
  | "cover"
  | "preparedToAid"
  | "delayed"
  | "forceFieldActive"
  | "forceFieldHp"
> {
  return {
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

/** Patch applied when toggling encounter off from the sheet header. */
export function encounterOffPatch(): Partial<RuntimeState> {
  return {
    encounter: false,
    ...explorationResetFields(),
  };
}

/** Apply exploration reset when encounter is off; no-op while in encounter. */
export function applyEncounterOffReset(runtime: RuntimeState): RuntimeState {
  if (runtime.encounter) return runtime;
  return { ...runtime, ...explorationResetFields() };
}

/** Client patch for an 8-hour rest; server applies healing and full reset. */
export function restPatch(runtime: RuntimeState): {
  action: "rest";
  currentHp: number;
  conditions: RuntimeState["conditions"];
} {
  return {
    action: "rest",
    currentHp: runtime.currentHp,
    conditions: runtime.conditions,
  };
}
