"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterSheet, RuntimeState } from "@/lib/types";
import {
  parseLocalRuntime,
  parseSheetResponse,
  type SaveInput,
  type SheetPatch,
} from "@/lib/shim-sham/patch";
import { patchSheet } from "../lib/api";
import { LOCAL_KEY } from "../lib/constants";

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

  const load = useCallback(async (signal: AbortSignal) => {
    try {
      const res = await fetch("/api/shim-sham", { signal });
      if (!res.ok) {
        throw new Error(`Failed to load character sheet (${res.status})`);
      }
      const data: unknown = await res.json();
      const parsed = parseSheetResponse(data);
      if (!parsed) {
        throw new Error("Invalid character sheet response");
      }

      if (signal.aborted) return;

      setKvConfigured(parsed.kvConfigured);
      if (!parsed.kvConfigured) {
        const local = localStorage.getItem(LOCAL_KEY);
        if (local) {
          const runtime = parseLocalRuntime(local);
          if (runtime) {
            const { buildCharacterSheet } = await import("@/lib/shim-sham/static");
            setSheet(buildCharacterSheet(runtime));
          } else {
            localStorage.removeItem(LOCAL_KEY);
            setSheet(parsed.sheet);
          }
        } else {
          setSheet(parsed.sheet);
        }
      } else {
        setSheet(parsed.sheet);
      }
      setError(null);
    } catch (e) {
      if (signal.aborted) return;
      setError(e instanceof Error ? e.message : "Failed to load character sheet.");
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
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
          ? { ...sheetRef.current.runtime, ...body }
          : body;
      const data = await patchSheet(payload);
      if (mountedRef.current) {
        setSheet(data.sheet);
        setKvConfigured(data.kvConfigured);
      }
      if (!data.kvConfigured) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(data.sheet.runtime));
      }
    });

    saveChainRef.current = task.catch(() => {});
    try {
      await task;
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
      throw e;
    }
  }, []);

  return { sheet, kvConfigured, loading, error, save };
}
