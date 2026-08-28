import { isKvConfigured, loadRuntimeState, saveRuntimeState } from "@/lib/kv";
import type { CharacterSheet } from "@/lib/types";
import { applySheetPatch, SheetPatchError } from "@/lib/shim-sham/apply-sheet-patch";
import {
  extractLocalBaseRuntime,
  parseSheetPatch,
  stripLocalBaseRuntime,
  type SheetPatch,
} from "@/lib/shim-sham/patch";
import { validatePatchBody } from "@/lib/shim-sham/patch-security";
import { buildCharacterSheet } from "@/lib/shim-sham/static";

export type SheetData = {
  sheet: CharacterSheet;
  kvConfigured: boolean;
};

export type SheetServiceError = {
  error: string;
};

export async function loadSheetData(): Promise<SheetData> {
  const runtime = await loadRuntimeState();
  return {
    sheet: buildCharacterSheet(runtime),
    kvConfigured: isKvConfigured(),
  };
}

export type SaveSheetInput = SheetPatch & {
  _baseRuntime?: import("@/lib/types").RuntimeState;
};

export async function saveSheetData(
  rawBody: SaveSheetInput,
): Promise<SheetData | SheetServiceError> {
  if (isKvConfigured() && extractLocalBaseRuntime(rawBody)) {
    return { error: "Unexpected _baseRuntime" };
  }

  const body = parseSheetPatch(stripLocalBaseRuntime(rawBody));
  if (!body) {
    return { error: "Invalid patch body" };
  }

  const violation = validatePatchBody(body);
  if (violation) {
    return { error: violation };
  }

  const previous = extractLocalBaseRuntime(rawBody) ?? (await loadRuntimeState());

  try {
    const runtime = applySheetPatch(previous, body);
    await saveRuntimeState(runtime);
    return {
      sheet: buildCharacterSheet(runtime),
      kvConfigured: isKvConfigured(),
    };
  } catch (e) {
    if (e instanceof SheetPatchError) {
      return { error: e.message };
    }
    return { error: "Invalid runtime state" };
  }
}
