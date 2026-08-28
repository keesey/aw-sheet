"use client";

import { useCallback, useEffect, useRef, type MutableRefObject } from "react";
import type { CharacterSheet, RuntimeState } from "@/lib/types";
import { resolveConditionEffects } from "@/lib/shim-sham/rules/condition-effects";
import { getSkillKeyAttributes } from "@/lib/shim-sham/rules/skills";
import type { SaveInput, SheetPatch } from "@/lib/shim-sham/rules/patch";
import type { SaveFn } from "../types";
import { appendSessionLogLine, sessionLogLineForSave } from "@/lib/shim-sham/sheet/session-log";

export function useSheetSave(
  sheet: CharacterSheet | null,
  save: SaveFn,
  notesDraftRef: MutableRefObject<string>,
  runtimeNotesRef: MutableRefObject<string>,
  setNotesDraft: (value: string) => void,
): SaveFn {
  const logContextRef = useRef<{ runtime: RuntimeState | null; maxHp: number }>({
    runtime: null,
    maxHp: 0,
  });

  useEffect(() => {
    if (!sheet) return;
    const effects = resolveConditionEffects(
      sheet.runtime.conditions,
      sheet.level,
      getSkillKeyAttributes(),
    );
    logContextRef.current = {
      runtime: sheet.runtime,
      maxHp: Math.max(1, sheet.level.maxHp + effects.maxHpDelta),
    };
  }, [sheet]);

  return useCallback(
    async (input: SaveInput) => {
      const ctx = logContextRef.current;
      const runtime = sheet?.runtime ?? ctx.runtime;
      if (!runtime) {
        throw new Error("Character sheet is not loaded");
      }

      const body: SheetPatch = typeof input === "function" ? input(runtime) : input;
      let notes = typeof body.notes === "string" ? body.notes : notesDraftRef.current;

      if (ctx.runtime && typeof body.notes !== "string") {
        const logLine = sessionLogLineForSave(body, ctx.runtime, { maxHp: ctx.maxHp });
        if (logLine) {
          notes = appendSessionLogLine(notes, logLine);
          notesDraftRef.current = notes;
          runtimeNotesRef.current = notes;
          setNotesDraft(notes);
        }
      }

      await save({ ...body, notes });
    },
    [save, sheet?.runtime, notesDraftRef, runtimeNotesRef, setNotesDraft],
  );
}
