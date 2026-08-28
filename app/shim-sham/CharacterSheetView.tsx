"use client";

import type { MutableRefObject } from "react";
import { BottomNav } from "./components/BottomNav";
import { AttributesSection } from "./components/sheet/AttributesSection";
import { LevelsPanel } from "./components/panels/LevelsPanel";
import { InventoryPanel } from "./components/panels/InventoryPanel";
import { ConditionsPanel } from "./components/panels/ConditionsPanel";
import { ConditionTags } from "./components/sheet/ConditionTags";
import { HpBlock } from "./components/sheet/HpBlock";
import { SheetHeader } from "./components/sheet/SheetHeader";
import { SkillsSection } from "./components/sheet/SkillsSection";
import { StatsGrid } from "./components/sheet/StatsGrid";
import { ActionsSection } from "./components/sheet/ActionsSection";
import { RecoverySection } from "./components/sheet/RecoverySection";
import { ExploreSection } from "./components/sheet/ExploreSection";
import { StrikesPanel } from "./components/panels/StrikesPanel";
import { AreaWeaponsPanel } from "./components/panels/AreaWeaponsPanel";
import { filterWeaponStrikes } from "@/lib/shim-sham/strikes";
import type { SheetViewModel } from "@/lib/shim-sham/sheet-view-model";
import type { StrikesOpenOptions } from "@/lib/shim-sham/strike-open-options";
import type { Panel, SaveFn } from "./types";

export function CharacterSheetView({
  vm,
  kvConfigured,
  error,
  panel,
  onPanelChange,
  strikesOpen,
  strikesOpenOptions,
  onStrikesOpenChange,
  onStrikesOpenOptionsChange,
  areaWeaponsOpen,
  onAreaWeaponsOpenChange,
  hpDeltaInput,
  onHpDeltaInputChange,
  creditInput,
  onCreditInputChange,
  notesDraft,
  onNotesDraftChange,
  notesFocusedRef,
  save,
  onRest,
  onApplyHpDelta,
}: {
  vm: SheetViewModel;
  kvConfigured: boolean;
  error: string | null;
  panel: Panel;
  onPanelChange: (panel: Panel) => void;
  strikesOpen: boolean;
  strikesOpenOptions: StrikesOpenOptions;
  onStrikesOpenChange: (open: boolean) => void;
  onStrikesOpenOptionsChange: (options: StrikesOpenOptions) => void;
  areaWeaponsOpen: boolean;
  onAreaWeaponsOpenChange: (open: boolean) => void;
  hpDeltaInput: string;
  onHpDeltaInputChange: (value: string) => void;
  creditInput: string;
  onCreditInputChange: (value: string) => void;
  notesDraft: string;
  onNotesDraftChange: (value: string) => void;
  notesFocusedRef: MutableRefObject<boolean>;
  save: SaveFn;
  onRest: () => void;
  onApplyHpDelta: (sign: -1 | 1) => void;
}) {
  const {
    data,
    level,
    runtime,
    effects,
    derived,
    skillConditionDelta,
    maxHp,
    currentHp,
    hpPct,
    ffPct,
    ffUsesLeft,
    actionsByCost,
    pilotingActionsByCost,
    displayAc,
    acDelta,
    inventoryBulk,
    effectiveStr,
    inventoryBulkMax,
    lockedConditionIds,
    bulkBarPct,
    bulkBarFillColor,
    strikeAction,
    athleticsBonus,
    areaWeapons,
    speedEntries,
    isDying,
  } = vm;

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

      <SheetHeader data={data} runtime={runtime} save={save} onRest={onRest} />

      <section className="sheet-content">
        <div className="sheet-column sheet-column--combat">
          <AttributesSection level={level} attributeDelta={effects.attributeDelta} />

          <HpBlock
            level={level}
            runtime={{ ...runtime, currentHp }}
            maxHp={maxHp}
            hpPct={hpPct}
            ffPct={ffPct}
            showForceField={runtime.encounter}
            hpDeltaInput={hpDeltaInput}
            onHpDeltaInputChange={onHpDeltaInputChange}
            onApplyHpDelta={onApplyHpDelta}
            save={save}
          />

          <StatsGrid
            data={data}
            level={level}
            runtime={runtime}
            displayAc={displayAc}
            acDelta={acDelta}
            effects={effects}
            showCredits={!runtime.encounter}
            showSpeed={!runtime.encounter}
            speedEntries={speedEntries}
            creditInput={creditInput}
            onCreditInputChange={onCreditInputChange}
            save={save}
          />

          <ConditionTags
            conditions={runtime.conditions}
            lockedConditionIds={lockedConditionIds}
            save={save}
          />
        </div>

        <div className="sheet-column sheet-column--strikes">
          {isDying ? (
            <RecoverySection
              conditions={runtime.conditions}
              currentHp={currentHp}
              level={runtime.level}
              save={save}
            />
          ) : runtime.encounter ? (
            <ActionsSection
              actionsByCost={actionsByCost}
              pilotingActionsByCost={pilotingActionsByCost}
              strikeAction={strikeAction}
              level={level}
              speedDelta={effects.speedDelta}
              runtime={runtime}
              ffUsesLeft={ffUsesLeft}
              save={save}
              onOpenStrikes={(options) => {
                onStrikesOpenOptionsChange(options);
                onStrikesOpenChange(true);
              }}
              onOpenAreaWeapons={() => onAreaWeaponsOpenChange(true)}
              encounter={runtime.encounter}
              jetpack={runtime.jetpack}
              panache={runtime.panache}
              meyelRerollUsed={runtime.meyelRerollUsed}
              locks={effects}
              athleticsBonus={athleticsBonus}
            />
          ) : (
            <ExploreSection
              skills={data.skills}
              skillDelta={skillConditionDelta}
              perception={derived.perception}
              perceptionDelta={derived.perception - level.perception}
            />
          )}
        </div>

        <div className="sheet-column sheet-column--skills">
          <SkillsSection
            skills={data.skills}
            skillDelta={skillConditionDelta}
            notesDraft={notesDraft}
            onNotesDraftChange={onNotesDraftChange}
            runtimeNotes={runtime.notes}
            notesFocusedRef={notesFocusedRef}
            save={save}
          />
        </div>
      </section>

      <div className="sheet-spacer" />

      <BottomNav onSelect={onPanelChange} />

      {panel === "levels" && (
        <LevelsPanel
          data={data}
          runtime={runtime}
          save={save}
          onClose={() => onPanelChange(null)}
        />
      )}

      {panel === "inventory" && (
        <InventoryPanel
          data={data}
          runtime={runtime}
          strModifier={effectiveStr}
          inventoryBulk={inventoryBulk}
          inventoryBulkMax={inventoryBulkMax}
          bulkBarPct={bulkBarPct}
          bulkBarFillColor={bulkBarFillColor}
          save={save}
          onClose={() => onPanelChange(null)}
        />
      )}

      {panel === "conditions" && (
        <ConditionsPanel
          conditions={runtime.conditions}
          lockedConditionIds={lockedConditionIds}
          save={save}
          onClose={() => onPanelChange(null)}
        />
      )}

      {strikesOpen && runtime.encounter && (
        <StrikesPanel
          weapons={filterWeaponStrikes(data.weapons, strikesOpenOptions.weaponFilter)}
          finisherDice={level.finisherDice}
          damageMode={strikesOpenOptions.damageMode}
          attackDelta={effects.finesseMeleeAttack}
          damagePenalized={effects.attributeDelta.STR < 0}
          onClose={() => onStrikesOpenChange(false)}
        />
      )}

      {areaWeaponsOpen && runtime.encounter && (
        <AreaWeaponsPanel weapons={areaWeapons} onClose={() => onAreaWeaponsOpenChange(false)} />
      )}
    </main>
  );
}
