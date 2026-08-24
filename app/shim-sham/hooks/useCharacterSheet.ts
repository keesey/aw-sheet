"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterSheet } from "@/lib/types";
import { patchSheet } from "../lib/api";
import { LOCAL_KEY } from "../lib/constants";

export function useCharacterSheet() {
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [kvConfigured, setKvConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sheetRef = useRef<CharacterSheet | null>(null);

  useEffect(() => {
    sheetRef.current = sheet;
  }, [sheet]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/shim-sham");
      const data = await res.json();
      setKvConfigured(data.kvConfigured);
      if (!data.kvConfigured) {
        const local = localStorage.getItem(LOCAL_KEY);
        if (local) {
          const { buildCharacterSheet } = await import("@/lib/shim-sham/static");
          setSheet(buildCharacterSheet(JSON.parse(local)));
        } else {
          setSheet(data.sheet);
        }
      } else {
        setSheet(data.sheet);
      }
    } catch {
      setError("Failed to load character sheet.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (body: Record<string, unknown>) => {
      try {
        setError(null);
        const payload =
          !kvConfigured && sheetRef.current
            ? { ...sheetRef.current.runtime, ...body }
            : body;
        const data = await patchSheet(payload);
        setSheet(data.sheet);
        setKvConfigured(data.kvConfigured);
        if (!data.kvConfigured) {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(data.sheet.runtime));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    },
    [kvConfigured],
  );

  return { sheet, kvConfigured, loading, error, save };
}
