"use client";

import { useEffect, useRef, useState } from "react";
import {
  FORCE_FIELD_DAILY_USES,
  FORCE_FIELD_MAX_HP,
} from "@/lib/shim-sham/static";
import {
  bulkBarColor,
  isEncumberedByBulk,
  maxBulkCapacity,
  totalBulk,
} from "@/lib/shim-sham/bulk";
import { BottomNav } from "./components/BottomNav";
import { ActionsPanel } from "./components/panels/ActionsPanel";
import { AbilitiesPanel } from "./components/panels/AbilitiesPanel";
import { InventoryPanel } from "./components/panels/InventoryPanel";
import { ConditionsPanel } from "./components/panels/ConditionsPanel";
import { ManagePanel } from "./components/panels/ManagePanel";
import { ConditionTags } from "./components/sheet/ConditionTags";
import { HpBlock } from "./components/sheet/HpBlock";
import { SheetHeader } from "./components/sheet/SheetHeader";
import { SkillsSection } from "./components/sheet/SkillsSection";
import { StatsGrid } from "./components/sheet/StatsGrid";
import { StrikesSection } from "./components/sheet/StrikesSection";
import { useCharacterSheet } from "./hooks/useCharacterSheet";
import type { Panel, SpeedEntry } from "./types";

export default function CharacterSheet() {
  const { sheet, kvConfigured, loading, error, save } = useCharacterSheet();
  const [panel, setPanel] = useState<Panel>(null);
  const [hpDeltaInput, setHpDeltaInput] = useState("");
  const [creditInput, setCreditInput] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const notesFocused = useRef(false);

  useEffect(() => {
    if (!notesFocused.current) {
      setNotesDraft(sheet?.runtime.notes ?? "");
    }
  }, [sheet?.runtime.notes]);

  const applyHpDelta = (sign: -1 | 1, currentHp: number, forceFieldHp: number) => {
    const trimmed = hpDeltaInput.trim();
    const parsed = parseInt(trimmed, 10);
    const amount = trimmed === "" || Number.isNaN(parsed) || parsed <= 0 ? 1 : parsed;
    void save({ action: "hp-delta", delta: sign * amount, currentHp, forceFieldHp });
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
  const hpPct = Math.round((runtime.currentHp / level.maxHp) * 100);
  const ffPct = Math.round((runtime.forceFieldHp / FORCE_FIELD_MAX_HP) * 100);
  const ffUsesLeft = FORCE_FIELD_DAILY_USES - runtime.forceFieldUsesUsed;

  const speedEntries: SpeedEntry[] = [
    { label: "Land", value: level.landSpeed, panacheBoost: true, accelerateBoost: true },
    level.flySpeed != null && runtime.jetpack
      ? { label: "Fly", value: level.flySpeed, panacheBoost: true, accelerateBoost: false }
      : null,
    level.climbSpeed != null
      ? { label: "Climb", value: level.climbSpeed, panacheBoost: true, accelerateBoost: true }
      : null,
    level.swimSpeed != null
      ? { label: "Swim", value: level.swimSpeed, panacheBoost: false, accelerateBoost: false }
      : null,
  ].filter((entry): entry is SpeedEntry => entry != null);

  const actionsByCost = {
    free: data.actions.filter((a) => a.cost === "free"),
    reaction: data.actions.filter((a) => a.cost === "reaction"),
    single: data.actions.filter((a) => a.cost === "single"),
    minute: data.actions.filter((a) => a.cost === "minute"),
  };
  const duelingParryAction = data.actions.find((a) => a.id === "dueling-parry");
  const displayAc = level.ac + (runtime.duelingParry ? 2 : 0);
  const inventoryBulk = totalBulk(data.inventory);
  const inventoryBulkMax = maxBulkCapacity(level.abilities.STR);
  const encumberedFromBulk = isEncumberedByBulk(inventoryBulk, level.abilities.STR);
  const lockedConditionIds = encumberedFromBulk ? ["encumbered"] : [];
  const bulkBarPct = Math.min(100, (inventoryBulk / inventoryBulkMax) * 100);
  const bulkBarFillColor = bulkBarColor(inventoryBulk, level.abilities.STR);

  return (
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

      <SheetHeader data={data} runtime={runtime} save={save} />

      <section className="sheet-content">
        <div className="sheet-column sheet-column--combat">
          <HpBlock
            level={level}
            runtime={runtime}
            hpPct={hpPct}
            ffPct={ffPct}
            ffUsesLeft={ffUsesLeft}
            hpDeltaInput={hpDeltaInput}
            onHpDeltaInputChange={setHpDeltaInput}
            onApplyHpDelta={(sign) => applyHpDelta(sign, runtime.currentHp, runtime.forceFieldHp)}
            save={save}
          />

          <StatsGrid
            data={data}
            level={level}
            runtime={runtime}
            speedEntries={speedEntries}
            displayAc={displayAc}
            duelingParryAction={duelingParryAction}
            creditInput={creditInput}
            onCreditInputChange={setCreditInput}
            save={save}
          />

          <ConditionTags
            conditions={runtime.conditions}
            lockedConditionIds={lockedConditionIds}
            save={save}
          />
        </div>

        <div className="sheet-column sheet-column--strikes">
          <StrikesSection
            weapons={data.weapons}
            finisherDice={level.finisherDice}
            panache={runtime.panache}
          />
        </div>

        <div className="sheet-column sheet-column--skills">
          <SkillsSection
            skills={data.skills}
            notesDraft={notesDraft}
            onNotesDraftChange={setNotesDraft}
            runtimeNotes={runtime.notes}
            notesFocused={notesFocused}
            save={save}
          />
        </div>
      </section>

      <div className="sheet-spacer" />

      <BottomNav onSelect={setPanel} />

      {panel === "actions" && (
        <ActionsPanel
          data={data}
          runtime={runtime}
          actionsByCost={actionsByCost}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === "abilities" && (
        <AbilitiesPanel level={level} onClose={() => setPanel(null)} />
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
          save={save}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === "conditions" && (
        <ConditionsPanel
          conditions={runtime.conditions}
          lockedConditionIds={lockedConditionIds}
          save={save}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === "manage" && (
        <ManagePanel data={data} runtime={runtime} save={save} onClose={() => setPanel(null)} />
      )}
    </main>
  );
}
