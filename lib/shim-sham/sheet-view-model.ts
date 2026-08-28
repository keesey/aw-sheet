import type { CharacterSheet } from "@/lib/types";
import {
  bulkBarColor,
  isEncumberedByBulk,
  maxBulkCapacity,
} from "@/lib/shim-sham/bulk";
import { inventoryTotalBulk } from "@/lib/shim-sham/inventory";
import {
  resolveConditionEffects,
  runtimeDerivedStats,
} from "@/lib/shim-sham/condition-effects";
import { buildSkillEntries, getSkillKeyAttributes, skillBonusByName } from "@/lib/shim-sham/skills";
import { circumstanceAcBonus } from "@/lib/shim-sham/ac-bonuses";
import { buildAreaWeaponEntries } from "@/lib/shim-sham/area-weapons";
import { buildStrikeAction } from "@/lib/shim-sham/strike-action";
import { getActiveCondition } from "@/lib/shim-sham/conditions";
import { compareByName } from "@/lib/shim-sham/sort";
import {
  FORCE_FIELD_DAILY_USES,
  FORCE_FIELD_MAX_HP,
} from "@/lib/shim-sham/static";
import { buildSpeedEntries } from "@/lib/shim-sham/speed";

export function deriveSheetViewModel(sheet: CharacterSheet) {
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

  const mainActions = data.actions.filter((a) => !a.pilotingOnly);
  const pilotingActions = data.actions.filter((a) => a.pilotingOnly);
  const groupByCost = (actions: typeof data.actions) => ({
    free: actions.filter((a) => a.cost === "free").sort(compareByName),
    reaction: actions.filter((a) => a.cost === "reaction").sort(compareByName),
    single: actions.filter((a) => a.cost === "single").sort(compareByName),
    double: actions.filter((a) => a.cost === "double").sort(compareByName),
    triple: actions.filter((a) => a.cost === "triple").sort(compareByName),
  });
  const actionsByCost = groupByCost(mainActions);
  const pilotingActionsByCost = groupByCost(pilotingActions);
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

  return {
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
  };
}

export type SheetViewModel = ReturnType<typeof deriveSheetViewModel>;
