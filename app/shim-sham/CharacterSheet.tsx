"use client";

import { useCallback, useMemo, useState } from "react";
import { restPatch } from "@/lib/shim-sham/runtime-reset";
import type { SheetPatch } from "@/lib/shim-sham/patch";
import { useCharacterSheet } from "./hooks/useCharacterSheet";
import { deriveSheetViewModel } from "./hooks/useSheetDerivedStats";
import { useSheetNotes } from "./hooks/useSheetNotes";
import { useSheetSave } from "./hooks/useSheetSave";
import { RollProvider } from "./context/RollContext";
import { UnlockGate } from "./components/UnlockGate";
import { formatRollSummary, type RollResult } from "./lib/roll";
import { appendSessionLogLine } from "./lib/session-log";
import {
  DEFAULT_STRIKES_OPEN,
  type StrikesOpenOptions,
} from "./lib/strike-format";
import type { Panel } from "./types";
import { CharacterSheetView } from "./CharacterSheetView";

export default function CharacterSheet() {
  const { sheet, kvConfigured, loading, needsUnlock, error, save, retryLoad } =
    useCharacterSheet();
  const [panel, setPanel] = useState<Panel>(null);
  const [strikesOpen, setStrikesOpen] = useState(false);
  const [strikesOpenOptions, setStrikesOpenOptions] =
    useState<StrikesOpenOptions>(DEFAULT_STRIKES_OPEN);
  const [areaWeaponsOpen, setAreaWeaponsOpen] = useState(false);
  const [hpDeltaInput, setHpDeltaInput] = useState("");
  const [creditInput, setCreditInput] = useState("");

  const {
    notesDraft,
    setNotesDraft,
    notesFocused,
    notesDraftRef,
    runtimeNotesRef,
  } = useSheetNotes(sheet?.runtime.notes);

  const saveSheet = useSheetSave(
    sheet,
    save,
    notesDraftRef,
    runtimeNotesRef,
    setNotesDraft,
  );

  const vm = useMemo(() => (sheet ? deriveSheetViewModel(sheet) : null), [sheet]);

  const handleRollResult = useCallback(
    (result: RollResult) => {
      const logLine = formatRollSummary(result);
      const nextNotes = appendSessionLogLine(notesDraftRef.current, logLine);
      notesDraftRef.current = nextNotes;
      runtimeNotesRef.current = nextNotes;
      setNotesDraft(nextNotes);

      const body: SheetPatch = { notes: nextNotes };
      if (
        result.kind === "strike" ||
        (result.kind === "check" && result.endsCover)
      ) {
        body.cover = "none";
      }
      if (result.kind === "strike" && result.damageMode === "finisher") {
        body.panache = false;
      }
      void saveSheet(body);
    },
    [notesDraftRef, runtimeNotesRef, saveSheet, setNotesDraft],
  );

  const applyHpDelta = useCallback(
    (sign: -1 | 1) => {
      if (!vm) return;
      const trimmed = hpDeltaInput.trim();
      const parsed = parseInt(trimmed, 10);
      const amount = trimmed === "" || Number.isNaN(parsed) || parsed <= 0 ? 1 : parsed;
      void saveSheet({
        action: "hp-delta",
        delta: sign * amount,
        currentHp: vm.currentHp,
        forceFieldHp: vm.runtime.forceFieldHp,
      });
      setHpDeltaInput("");
    },
    [hpDeltaInput, saveSheet, vm],
  );

  const handleRest = useCallback(() => {
    if (
      !confirm(
        "Rest for 8 hours? Heals CON×level HP, resets daily abilities, and clears panache.",
      )
    ) {
      return;
    }
    if (!sheet) return;
    void saveSheet(restPatch(sheet.runtime));
  }, [saveSheet, sheet]);

  if (needsUnlock) {
    return <UnlockGate onUnlocked={retryLoad} />;
  }

  if (loading) {
    return (
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading Shim Sham…</p>
      </main>
    );
  }

  if (!sheet || !vm) {
    return (
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <p>{error ?? "Character not found."}</p>
      </main>
    );
  }

  return (
    <RollProvider onRollResult={handleRollResult}>
      <CharacterSheetView
        vm={vm}
        kvConfigured={kvConfigured}
        error={error}
        panel={panel}
        onPanelChange={setPanel}
        strikesOpen={strikesOpen}
        strikesOpenOptions={strikesOpenOptions}
        onStrikesOpenChange={setStrikesOpen}
        onStrikesOpenOptionsChange={setStrikesOpenOptions}
        areaWeaponsOpen={areaWeaponsOpen}
        onAreaWeaponsOpenChange={setAreaWeaponsOpen}
        hpDeltaInput={hpDeltaInput}
        onHpDeltaInputChange={setHpDeltaInput}
        creditInput={creditInput}
        onCreditInputChange={setCreditInput}
        notesDraft={notesDraft}
        onNotesDraftChange={setNotesDraft}
        notesFocusedRef={notesFocused}
        save={saveSheet}
        onRest={handleRest}
        onApplyHpDelta={applyHpDelta}
      />
    </RollProvider>
  );
}
