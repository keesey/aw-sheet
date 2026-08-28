"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterSheet, RuntimeState } from "@/lib/types";
import {
  parseLocalRuntime,
  type SaveInput,
  type SheetPatch,
} from "@/lib/shim-sham/rules/patch";
import { loadSheetAction, saveSheetAction } from "../actions";
import { LOCAL_KEY } from "../client/constants";

function resolvePatch(
  input: SaveInput,
  runtime: RuntimeState | undefined,
): SheetPatch {
  if (typeof input === "function") {
    if (!runtime) {
      throw new Error("Character sheet is not loaded");
    }
    return input(runtime);
  }
  return input;
}

export function useCharacterSheet() {
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [kvConfigured, setKvConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sheetRef = useRef<CharacterSheet | null>(null);
  const kvConfiguredRef = useRef(kvConfigured);
  const mountedRef = useRef(true);
  const saveChainRef = useRef(Promise.resolve());

  useEffect(() => {
    sheetRef.current = sheet;
  }, [sheet]);

  useEffect(() => {
    kvConfiguredRef.current = kvConfigured;
  }, [kvConfigured]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const applyLoadedSheet = useCallback(
    async (
      data: { sheet: CharacterSheet; kvConfigured: boolean },
      signal: AbortSignal,
    ) => {
      if (signal.aborted) return;

      setNeedsUnlock(false);
      setKvConfigured(data.kvConfigured);
      if (!data.kvConfigured) {
        const local = localStorage.getItem(LOCAL_KEY);
        if (local) {
          const runtime = parseLocalRuntime(local);
          if (runtime) {
            const { buildCharacterSheet } = await import("@/lib/shim-sham/sheet/static");
            setSheet(buildCharacterSheet(runtime));
          } else {
            localStorage.removeItem(LOCAL_KEY);
            setSheet(data.sheet);
          }
        } else {
          setSheet(data.sheet);
        }
      } else {
        setSheet(data.sheet);
      }
      setError(null);
    },
    [],
  );

  const load = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      try {
        const result = await loadSheetAction();
        if (signal.aborted) return;
        if (!result.ok) {
          if ("unauthorized" in result) {
            setNeedsUnlock(true);
            setSheet(null);
            setError(null);
            return;
          }
          setError(result.error);
          return;
        }
        await applyLoadedSheet(result, signal);
      } catch (e) {
        if (signal.aborted) return;
        setError(e instanceof Error ? e.message : "Failed to load character sheet.");
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [applyLoadedSheet],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const retryLoad = useCallback(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const save = useCallback(async (input: SaveInput) => {
    const task = saveChainRef.current.then(async () => {
      const body = resolvePatch(input, sheetRef.current?.runtime);
      setError(null);
      const payload =
        !kvConfiguredRef.current && sheetRef.current
          ? { _baseRuntime: sheetRef.current.runtime, ...body }
          : body;
      const result = await saveSheetAction(payload);
      if (!result.ok) {
        if ("unauthorized" in result) {
          if (mountedRef.current) {
            setNeedsUnlock(true);
            setError(null);
          }
          throw new Error("Unauthorized");
        }
        throw new Error(result.error);
      }
      if (mountedRef.current) {
        setSheet(result.sheet);
        setKvConfigured(result.kvConfigured);
      }
      if (!result.kvConfigured) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(result.sheet.runtime));
      }
    });

    saveChainRef.current = task.catch(() => {});
    try {
      await task;
    } catch (e) {
      if (mountedRef.current && e instanceof Error && e.message !== "Unauthorized") {
        setError(e.message || "Save failed");
      }
      throw e;
    }
  }, []);

  return { sheet, kvConfigured, loading, needsUnlock, error, save, retryLoad };
}
