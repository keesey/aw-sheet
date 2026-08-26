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
import { resolveConditionEffects, runtimeDerivedStats } from "@/lib/shim-sham/condition-effects";
import { buildSkillEntries, getSkillKeyAttributes, skillBonusByName } from "@/lib/shim-sham/skills";
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
import { getActiveCondition } from "@/lib/shim-sham/conditions";
import { StrikesPanel } from "./components/panels/StrikesPanel";
import { AreaWeaponsPanel } from "./components/panels/AreaWeaponsPanel";
import { buildStrikeAction } from "@/lib/shim-sham/strike-action";
import { buildAreaWeaponEntries } from "@/lib/shim-sham/area-weapons";
import { filterWeaponStrikes } from "@/lib/shim-sham/strikes";
import { circumstanceAcBonus } from "@/lib/shim-sham/ac-bonuses";
import { buildSpeedEntries } from "./lib/speed";
import type { RuntimeState } from "@/lib/types";
import { useCharacterSheet } from "./hooks/useCharacterSheet";
import { RollProvider } from "./context/RollContext";
import { formatRollSummary, type RollResult } from "./lib/roll";
import { appendSessionLogLine, sessionLogLineForSave } from "./lib/session-log";
import {
  DEFAULT_STRIKES_OPEN,
  type StrikesOpenOptions,
} from "./lib/strike-format";
import type { Panel } from "./types";

export default function CharacterSheet() {
  const { sheet, kvConfigured, loading, error, save } = useCharacterSheet();
  const [panel, setPanel] = useState<Panel>(null);
  const [strikesOpen, setStrikesOpen] = useState(false);
  const [strikesOpenOptions, setStrikesOpenOptions] =
    useState<StrikesOpenOptions>(DEFAULT_STRIKES_OPEN);
  const [areaWeaponsOpen, setAreaWeaponsOpen] = useState(false);
  const [hpDeltaInput, setHpDeltaInput] = useState("");
  const [creditInput, setCreditInput] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const notesFocused = useRef(false);
  const notesDraftRef = useRef(notesDraft);
  const runtimeNotesRef = useRef("");
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
      const ctx = logContextRef.current;
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
    [save],
  );

  const handleRollResult = useCallback(
    (result: RollResult) => {
      const logLine = formatRollSummary(result);
      const nextNotes = appendSessionLogLine(notesDraftRef.current, logLine);
      notesDraftRef.current = nextNotes;
      runtimeNotesRef.current = nextNotes;
      setNotesDraft(nextNotes);

      const body: Record<string, unknown> = { notes: nextNotes };
      if (result.kind === "strike" && result.damageMode === "finisher") {
        body.panache = false;
      }
      void saveSheet(body);
    },
    [saveSheet],
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
  const effects = resolveConditionEffects(runtime.conditions, level, getSkillKeyAttributes());
  const derived = runtimeDerivedStats(level, effects);
  const baseSkills = buildSkillEntries(level);
  const skillConditionDelta = Object.fromEntries(
    data.skills.map((skill) => {
      const base = baseSkills.find((entry) => entry.name === skill.name);
      return [skill.name, base ? skill.bonus - base.bonus : 0];
    }),
  );
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
    triple: data.actions.filter((a) => a.cost === "triple").sort(byActionName),
  };
  const circumstanceBonus = circumstanceAcBonus(runtime);
  const displayAc = derived.ac + circumstanceBonus;
  const acDelta = derived.ac - level.ac + circumstanceBonus;
  const inventoryBulk = inventoryTotalBulk(data.inventory, data.consumableCatalog, runtime);
  const effectiveStr = level.attributes.STR + effects.attributeDelta.STR;
  const inventoryBulkMax = maxBulkCapacity(effectiveStr);
  const encumberedFromBulk = isEncumberedByBulk(inventoryBulk, effectiveStr);
  const lockedConditionIds = encumberedFromBulk ? ["encumbered"] : [];
  const bulkBarPct = Math.min(100, (inventoryBulk / inventoryBulkMax) * 100);
  const bulkBarFillColor = bulkBarColor(inventoryBulk, effectiveStr);
  const strikeAction = buildStrikeAction();
  const athleticsBonus = skillBonusByName(data.skills, "Athletics");
  const areaWeapons = buildAreaWeaponEntries(
    data.weapons,
    data.consumableCatalog,
    runtime.consumables,
  );
  const speedEntries = buildSpeedEntries(level, runtime.jetpack);
  const isDying = getActiveCondition(runtime.conditions, "dying") != null;

  const handleRest = () => {
    if (
      !confirm(
        "Rest for 8 hours? Heals CON×level HP, resets daily abilities, and clears panache.",
      )
    ) {
      return;
    }
    void saveSheet({
      action: "rest",
      currentHp: runtime.currentHp,
      conditions: runtime.conditions,
      forceFieldUsesUsed: 0,
      forceFieldHp: 0,
      forceFieldActive: false,
      meyelRerollUsed: false,
      panache: false,
      accelerate: false,
      jetpack: false,
      preparedToAid: false,
      delayed: false,
      encounter: false,
    });
  };

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

      <SheetHeader data={data} runtime={runtime} save={saveSheet} onRest={handleRest} />

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
            showCredits={!runtime.encounter}
            showSpeed={!runtime.encounter}
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
          {isDying ? (
            <RecoverySection
              conditions={runtime.conditions}
              currentHp={currentHp}
              level={runtime.level}
              save={saveSheet}
            />
          ) : runtime.encounter ? (
            <ActionsSection
              actionsByCost={actionsByCost}
              strikeAction={strikeAction}
              level={level}
              speedDelta={effects.speedDelta}
              runtime={runtime}
              ffUsesLeft={ffUsesLeft}
              save={saveSheet}
              onOpenStrikes={(options) => {
                setStrikesOpenOptions(options);
                setStrikesOpen(true);
              }}
              onOpenAreaWeapons={() => setAreaWeaponsOpen(true)}
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
            onNotesDraftChange={setNotesDraft}
            runtimeNotes={runtime.notes}
            notesFocusedRef={notesFocused}
            save={saveSheet}
          />
        </div>
      </section>

      <div className="sheet-spacer" />

      <BottomNav onSelect={setPanel} />

      {panel === "levels" && (
        <LevelsPanel
          data={data}
          runtime={runtime}
          save={saveSheet}
          onClose={() => setPanel(null)}
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

      {strikesOpen && runtime.encounter && (
        <StrikesPanel
          weapons={filterWeaponStrikes(data.weapons, strikesOpenOptions.weaponFilter)}
          finisherDice={level.finisherDice}
          damageMode={strikesOpenOptions.damageMode}
          attackDelta={effects.finesseMeleeAttack}
          damagePenalized={effects.attributeDelta.STR < 0}
          onClose={() => setStrikesOpen(false)}
        />
      )}

      {areaWeaponsOpen && runtime.encounter && (
        <AreaWeaponsPanel weapons={areaWeapons} onClose={() => setAreaWeaponsOpen(false)} />
      )}
    </main>
    </RollProvider>
  );
}
