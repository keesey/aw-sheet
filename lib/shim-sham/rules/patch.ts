import type { ActiveCondition, CharacterSheet, CoverLevel, RuntimeState } from "@/lib/types";
import { sanitizeOptionalUrl } from "@/lib/shim-sham/url";

export const MAX_NOTES_LENGTH = 32_768;
export const MAX_REQUEST_BODY_BYTES = 65_536;

export type SheetPatchAction =
  | "rest"
  | "level-up"
  | "activate-force-field"
  | "deactivate-force-field"
  | "force-field-regen"
  | "hp-delta"
  | "recovery-check";

export type SheetPatch = Partial<RuntimeState> & {
  action?: SheetPatchAction;
  delta?: number;
  d20?: number;
};

export type PatchUpdater = (runtime: RuntimeState) => SheetPatch;

export type SaveInput = SheetPatch | PatchUpdater;

const COVER_LEVELS = new Set<CoverLevel>(["none", "standard", "greater"]);

const PATCH_ACTIONS = new Set<SheetPatchAction>([
  "rest",
  "level-up",
  "activate-force-field",
  "deactivate-force-field",
  "force-field-regen",
  "hp-delta",
  "recovery-check",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isActiveCondition(value: unknown): value is ActiveCondition {
  return isRecord(value) && typeof value.id === "string";
}

function parseBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function parseNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function parseString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseCover(value: unknown): CoverLevel | undefined {
  return typeof value === "string" && COVER_LEVELS.has(value as CoverLevel)
    ? (value as CoverLevel)
    : undefined;
}

function parseConditions(value: unknown): ActiveCondition[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const conditions = value.filter(isActiveCondition);
  return conditions.length === value.length ? conditions : undefined;
}

function parseConsumables(
  value: unknown,
): Record<string, number> | undefined {
  if (!isRecord(value)) return undefined;
  const entries = Object.entries(value);
  if (!entries.every(([, qty]) => typeof qty === "number" && Number.isFinite(qty))) {
    return undefined;
  }
  return value as Record<string, number>;
}

function parseBatteries(
  value: unknown,
): RuntimeState["batteries"] | undefined {
  if (!Array.isArray(value)) return undefined;
  const batteries = value.filter(
    (entry): entry is RuntimeState["batteries"][number] =>
      isRecord(entry) &&
      typeof entry.id === "string" &&
      typeof entry.charges === "number" &&
      typeof entry.max === "number",
  );
  return batteries.length === value.length ? batteries : undefined;
}

function parseAdHocItems(
  value: unknown,
): RuntimeState["adHocItems"] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items: RuntimeState["adHocItems"] = [];
  for (const entry of value) {
    if (
      !isRecord(entry) ||
      typeof entry.id !== "string" ||
      typeof entry.name !== "string" ||
      typeof entry.bulk !== "string"
    ) {
      return undefined;
    }
    const url =
      entry.url === undefined
        ? undefined
        : typeof entry.url === "string"
          ? sanitizeOptionalUrl(entry.url)
          : undefined;
    if (entry.url !== undefined && typeof entry.url === "string" && !url) {
      return undefined;
    }
    items.push({
      id: entry.id,
      name: entry.name,
      bulk: entry.bulk,
      ...(url ? { url } : {}),
    });
  }
  return items;
}

/** Strip unknown keys and coerce known runtime patch fields from a request body. */
export function parseSheetPatch(body: unknown): SheetPatch | null {
  if (!isRecord(body)) return null;

  const patch: SheetPatch = {};
  const action = body.action;
  if (action !== undefined) {
    if (typeof action !== "string" || !PATCH_ACTIONS.has(action as SheetPatchAction)) {
      return null;
    }
    patch.action = action as SheetPatchAction;
  }

  const delta = parseNumber(body.delta);
  if (delta !== undefined) patch.delta = delta;

  const d20 = parseNumber(body.d20);
  if (d20 !== undefined) patch.d20 = d20;

  const currentHp = parseNumber(body.currentHp);
  if (currentHp !== undefined) patch.currentHp = Math.floor(currentHp);

  const forceFieldHp = parseNumber(body.forceFieldHp);
  if (forceFieldHp !== undefined) patch.forceFieldHp = Math.max(0, Math.floor(forceFieldHp));

  const chemTankCharges = parseNumber(body.chemTankCharges);
  if (chemTankCharges !== undefined) patch.chemTankCharges = Math.floor(chemTankCharges);

  const breachingGunMagazine = parseNumber(body.breachingGunMagazine);
  if (breachingGunMagazine !== undefined) {
    patch.breachingGunMagazine = Math.floor(breachingGunMagazine);
  }

  const credits = parseNumber(body.credits);
  if (credits !== undefined) patch.credits = Math.floor(credits);

  const notes = parseString(body.notes);
  if (notes !== undefined) {
    if (notes.length > MAX_NOTES_LENGTH) return null;
    patch.notes = notes;
  }

  const cover = parseCover(body.cover);
  if (cover !== undefined) patch.cover = cover;

  const encounter = parseBoolean(body.encounter);
  if (encounter !== undefined) patch.encounter = encounter;

  const panache = parseBoolean(body.panache);
  if (panache !== undefined) patch.panache = panache;

  const accelerate = parseBoolean(body.accelerate);
  if (accelerate !== undefined) patch.accelerate = accelerate;

  const jetpack = parseBoolean(body.jetpack);
  if (jetpack !== undefined) patch.jetpack = jetpack;

  const duelingParry = parseBoolean(body.duelingParry);
  if (duelingParry !== undefined) patch.duelingParry = duelingParry;

  const batonParry = parseBoolean(body.batonParry);
  if (batonParry !== undefined) patch.batonParry = batonParry;

  const preparedToAid = parseBoolean(body.preparedToAid);
  if (preparedToAid !== undefined) patch.preparedToAid = preparedToAid;

  const delayed = parseBoolean(body.delayed);
  if (delayed !== undefined) patch.delayed = delayed;

  const meyelRerollUsed = parseBoolean(body.meyelRerollUsed);
  if (meyelRerollUsed !== undefined) patch.meyelRerollUsed = meyelRerollUsed;

  const conditions = parseConditions(body.conditions);
  if (conditions !== undefined) patch.conditions = conditions;

  const consumables = parseConsumables(body.consumables);
  if (consumables !== undefined) patch.consumables = consumables;

  const batteries = parseBatteries(body.batteries);
  if (batteries !== undefined) patch.batteries = batteries;

  const adHocItems = parseAdHocItems(body.adHocItems);
  if (body.adHocItems !== undefined) {
    if (adHocItems === undefined) return null;
    patch.adHocItems = adHocItems;
  }

  return patch;
}

function hasRuntimeShape(value: unknown): value is RuntimeState {
  if (!isRecord(value)) return false;
  return (
    typeof value.level === "number" &&
    typeof value.currentHp === "number" &&
    typeof value.encounter === "boolean" &&
    Array.isArray(value.conditions)
  );
}

function hasCharacterSheetShape(value: unknown): value is CharacterSheet {
  if (!isRecord(value)) return false;
  if (!isRecord(value.static) || !isRecord(value.level)) return false;
  return hasRuntimeShape(value.runtime);
}

export function parseSheetResponse(data: unknown): {
  sheet: CharacterSheet;
  kvConfigured: boolean;
} | null {
  if (!isRecord(data) || typeof data.kvConfigured !== "boolean") return null;
  if (!hasCharacterSheetShape(data.sheet)) return null;
  return { sheet: data.sheet, kvConfigured: data.kvConfigured };
}

export function parseLocalRuntime(raw: string): RuntimeState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return hasRuntimeShape(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Client-provided runtime base used only when server persistence is disabled. */
export function extractLocalBaseRuntime(rawBody: unknown): RuntimeState | null {
  if (!isRecord(rawBody) || !hasRuntimeShape(rawBody._baseRuntime)) return null;
  return rawBody._baseRuntime;
}

export function stripLocalBaseRuntime(rawBody: unknown): unknown {
  if (!isRecord(rawBody)) return rawBody;
  const rest = { ...rawBody };
  delete rest._baseRuntime;
  return rest;
}
