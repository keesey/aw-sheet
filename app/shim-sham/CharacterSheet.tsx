"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FORCE_FIELD_DAILY_USES,
  FORCE_FIELD_MAX_HP,
} from "@/lib/shim-sham/static";
import {
  bulkBarColor,
  isEncumberedByBulk,
  maxBulkCapacity,
} from "@/lib/shim-sham/bulk";
import { inventoryTotalBulk } from "@/lib/shim-sham/inventory";
import { resolveConditionEffects } from "@/lib/shim-sham/condition-effects";
import { getSkillKeyAbilities } from "@/lib/shim-sham/skills";
import { BottomNav } from "./components/BottomNav";
import { AbilitiesPanel } from "./components/panels/AbilitiesPanel";
import { FeatsPanel } from "./components/panels/FeatsPanel";
import { InventoryPanel } from "./components/panels/InventoryPanel";
import { ConditionsPanel } from "./components/panels/ConditionsPanel";
import { ManagePanel } from "./components/panels/ManagePanel";
import { ConditionTags } from "./components/sheet/ConditionTags";
import { HpBlock } from "./components/sheet/HpBlock";
import { SheetHeader } from "./components/sheet/SheetHeader";
import { SkillsSection } from "./components/sheet/SkillsSection";
import { StatsGrid } from "./components/sheet/StatsGrid";
import { ActionsSection } from "./components/sheet/ActionsSection";
import { ExploreSection } from "./components/sheet/ExploreSection";
import { StrikesPanel } from "./components/panels/StrikesPanel";
import { AreaWeaponsPanel } from "./components/panels/AreaWeaponsPanel";
import { buildStrikeAction } from "@/lib/shim-sham/strike-action";
import { buildAreaWeaponEntries } from "@/lib/shim-sham/area-weapons";
import { circumstanceAcBonus } from "@/lib/shim-sham/ac-bonuses";
import { buildSpeedEntries } from "./lib/speed";
import { useCharacterSheet } from "./hooks/useCharacterSheet";
import { RollProvider } from "./context/RollContext";
import { formatRollSummary, type RollResult } from "./lib/roll";
import type { StrikeDamageMode } from "./lib/strike-format";
import type { Panel } from "./types";

export default function CharacterSheet() {
  const { sheet, kvConfigured, loading, error, save } = useCharacterSheet();
  const [panel, setPanel] = useState<Panel>(null);
  const [strikesOpen, setStrikesOpen] = useState(false);
  const [strikesDamageMode, setStrikesDamageMode] = useState<StrikeDamageMode>("default");
  const [areaWeaponsOpen, setAreaWeaponsOpen] = useState(false);
  const [hpDeltaInput, setHpDeltaInput] = useState("");
  const [creditInput, setCreditInput] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const notesFocused = useRef(false);
  const notesDraftRef = useRef(notesDraft);
  const runtimeNotesRef = useRef("");

  useEffect(() => {
    notesDraftRef.current = notesDraft;
  }, [notesDraft]);

  useEffect(() => {
    const runtimeNotes = sheet?.runtime.notes ?? "";
    const previousRuntimeNotes = runtimeNotesRef.current;
    runtimeNotesRef.current = runtimeNotes;

    if (!notesFocused.current && notesDraftRef.current === previousRuntimeNotes) {
      setNotesDraft(runtimeNotes);
    }
  }, [sheet?.runtime.notes]);

  const saveSheet = useCallback(
    async (body: Record<string, unknown>) => {
      await save({ ...body, notes: notesDraftRef.current });
    },
    [save],
  );

  const appendSessionNote = useCallback(
    (line: string) => {
      const base = notesFocused.current ? notesDraftRef.current : runtimeNotesRef.current;
      const next = base ? `${base}\n${line}` : line;
      runtimeNotesRef.current = next;
      setNotesDraft(next);
      notesDraftRef.current = next;
      void saveSheet({ notes: next });
    },
    [saveSheet],
  );

  const handleRollResult = useCallback(
    (result: RollResult) => {
      appendSessionNote(formatRollSummary(result));
    },
    [appendSessionNote],
  );

  const applyHpDelta = (sign: -1 | 1, currentHp: number, forceFieldHp: number) => {
    const trimmed = hpDeltaInput.trim();
    const parsed = parseInt(trimmed, 10);
    const amount = trimmed === "" || Number.isNaN(parsed) || parsed <= 0 ? 1 : parsed;
    void saveSheet({ action: "hp-delta", delta: sign * amount, currentHp, forceFieldHp });
    setHpDeltaInput("");
  };

  if (loading) {
    return (
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading Shim Sham…</p>
      </main>
    );
  }

  if (!sheet) {
    return (
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <p>{error ?? "Character not found."}</p>
      </main>
    );
  }

  const { static: data, level, runtime } = sheet;
  const effects = resolveConditionEffects(runtime.conditions, level, getSkillKeyAbilities());
  const maxHp = Math.max(1, level.maxHp + effects.maxHpDelta);
  const currentHp = Math.min(runtime.currentHp, maxHp);
  const hpPct = Math.round((currentHp / maxHp) * 100);
  const ffPct = Math.round((runtime.forceFieldHp / FORCE_FIELD_MAX_HP) * 100);
  const ffUsesLeft = FORCE_FIELD_DAILY_USES - runtime.forceFieldUsesUsed;

  const byActionName = (a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  const actionsByCost = {
    free: data.actions.filter((a) => a.cost === "free").sort(byActionName),
    reaction: data.actions.filter((a) => a.cost === "reaction").sort(byActionName),
    single: data.actions.filter((a) => a.cost === "single").sort(byActionName),
    double: data.actions.filter((a) => a.cost === "double").sort(byActionName),
  };
  const circumstanceBonus = circumstanceAcBonus(runtime);
  const displayAc = level.ac + circumstanceBonus + effects.ac;
  const acDelta = circumstanceBonus + effects.ac;
  const inventoryBulk = inventoryTotalBulk(data.inventory, data.consumableCatalog, runtime);
  const inventoryBulkMax = maxBulkCapacity(level.abilities.STR);
  const encumberedFromBulk = isEncumberedByBulk(inventoryBulk, level.abilities.STR);
  const lockedConditionIds = encumberedFromBulk ? ["encumbered"] : [];
  const bulkBarPct = Math.min(100, (inventoryBulk / inventoryBulkMax) * 100);
  const bulkBarFillColor = bulkBarColor(inventoryBulk, level.abilities.STR);
  const strikeAction = buildStrikeAction();
  const areaWeapons = buildAreaWeaponEntries(
    data.weapons,
    data.consumableCatalog,
    runtime.consumables,
  );
  const speedEntries = buildSpeedEntries(level, runtime.jetpack);

  return (
    <RollProvider onRollResult={handleRollResult}>
    <main className="sheet-page">
      {!kvConfigured && (
        <div className="save-banner">
          Vercel Redis not configured — saving to this browser only.
        </div>
      )}
      {error && (
        <div
          className="save-banner"
          style={{ background: "#450a0a", borderColor: "#991b1b", color: "#fecaca" }}
        >
          {error}
        </div>
      )}

      <SheetHeader data={data} runtime={runtime} save={saveSheet} />

      <section className="sheet-content">
        <div className="sheet-column sheet-column--combat">
          <HpBlock
            level={level}
            runtime={{ ...runtime, currentHp }}
            maxHp={maxHp}
            hpPct={hpPct}
            ffPct={ffPct}
            showForceField={runtime.combat}
            hpDeltaInput={hpDeltaInput}
            onHpDeltaInputChange={setHpDeltaInput}
            onApplyHpDelta={(sign) => applyHpDelta(sign, currentHp, runtime.forceFieldHp)}
            save={saveSheet}
          />

          <StatsGrid
            data={data}
            level={level}
            runtime={runtime}
            displayAc={displayAc}
            acDelta={acDelta}
            effects={effects}
            showCredits={!runtime.combat}
            showSpeed={!runtime.combat}
            speedEntries={speedEntries}
            creditInput={creditInput}
            onCreditInputChange={setCreditInput}
            save={saveSheet}
          />

          <ConditionTags
            conditions={runtime.conditions}
            lockedConditionIds={lockedConditionIds}
            save={saveSheet}
          />
        </div>

        <div className="sheet-column sheet-column--strikes">
          {runtime.combat ? (
            <ActionsSection
              actionsByCost={actionsByCost}
              strikeAction={strikeAction}
              level={level}
              speedDelta={effects.speedDelta}
              runtime={runtime}
              ffUsesLeft={ffUsesLeft}
              save={saveSheet}
              onOpenStrikes={(mode) => {
                setStrikesDamageMode(mode);
                setStrikesOpen(true);
              }}
              onOpenAreaWeapons={() => setAreaWeaponsOpen(true)}
              combat={runtime.combat}
              jetpack={runtime.jetpack}
              panache={runtime.panache}
              meyelRerollUsed={runtime.meyelRerollUsed}
              locks={effects}
            />
          ) : (
            <ExploreSection
              skills={data.skills}
              skillDelta={effects.skillDelta}
              perception={level.perception + effects.perception}
              perceptionDelta={effects.perception}
            />
          )}
        </div>

        <div className="sheet-column sheet-column--skills">
          <SkillsSection
            skills={data.skills}
            skillDelta={effects.skillDelta}
            notesDraft={notesDraft}
            onNotesDraftChange={setNotesDraft}
            runtimeNotes={runtime.notes}
            notesFocusedRef={notesFocused}
            save={saveSheet}
          />
        </div>
      </section>

      <div className="sheet-spacer" />

      <BottomNav onSelect={setPanel} />

      {panel === "abilities" && (
        <AbilitiesPanel level={level} onClose={() => setPanel(null)} />
      )}

      {panel === "feats" && (
        <FeatsPanel currentLevel={runtime.level} onClose={() => setPanel(null)} />
      )}

      {panel === "inventory" && (
        <InventoryPanel
          data={data}
          runtime={runtime}
          level={level}
          inventoryBulk={inventoryBulk}
          inventoryBulkMax={inventoryBulkMax}
          bulkBarPct={bulkBarPct}
          bulkBarFillColor={bulkBarFillColor}
          save={saveSheet}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === "conditions" && (
        <ConditionsPanel
          conditions={runtime.conditions}
          lockedConditionIds={lockedConditionIds}
          save={saveSheet}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === "manage" && (
        <ManagePanel data={data} runtime={runtime} save={saveSheet} onClose={() => setPanel(null)} />
      )}

      {strikesOpen && runtime.combat && (
        <StrikesPanel
          weapons={data.weapons}
          finisherDice={level.finisherDice}
          damageMode={strikesDamageMode}
          attackDelta={effects.finesseMeleeAttack}
          damagePenalized={effects.strDamage < 0}
          onClose={() => setStrikesOpen(false)}
        />
      )}

      {areaWeaponsOpen && runtime.combat && (
        <AreaWeaponsPanel weapons={areaWeapons} onClose={() => setAreaWeaponsOpen(false)} />
      )}
    </main>
    </RollProvider>
  );
}
