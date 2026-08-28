"use server";

import {
  assertAuthenticated,
  isAuthRequired,
  setAccessCookie,
  verifyAccessToken,
} from "@/lib/shim-sham/auth";
import { loadSheetData, saveSheetData, type SaveSheetInput } from "@/lib/shim-sham/sheet-service";
import type { CharacterSheet } from "@/lib/types";

export type SheetActionResult =
  | { ok: true; sheet: CharacterSheet; kvConfigured: boolean }
  | { ok: false; unauthorized: true }
  | { ok: false; error: string };

export type UnlockResult = { ok: true } | { ok: false; error: string };

export async function loadSheetAction(): Promise<SheetActionResult> {
  try {
    await assertAuthenticated();
  } catch {
    return { ok: false, unauthorized: true };
  }

  const data = await loadSheetData();
  return { ok: true, ...data };
}

export async function saveSheetAction(payload: SaveSheetInput): Promise<SheetActionResult> {
  try {
    await assertAuthenticated();
  } catch {
    return { ok: false, unauthorized: true };
  }

  const result = await saveSheetData(payload);
  if ("error" in result) {
    return { ok: false, error: result.error };
  }
  return { ok: true, ...result };
}

export async function unlockSheetAction(token: string): Promise<UnlockResult> {
  if (!isAuthRequired()) {
    return { ok: true };
  }

  if (!token.trim() || !verifyAccessToken(token)) {
    return { ok: false, error: "Invalid access token" };
  }

  try {
    await setAccessCookie();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unlock failed" };
  }
}
