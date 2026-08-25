import type { AttributeKey, ActiveCondition, LevelSnapshot } from "@/lib/types";
import { armorClass } from "@/lib/shim-sham/armor";
import { classDc } from "@/lib/shim-sham/class-dc";
import { getActiveCondition, isValuedCondition } from "@/lib/shim-sham/conditions";
import { perception } from "@/lib/shim-sham/perception";
import { savingThrows } from "@/lib/shim-sham/saves";

type PenaltyType = "status" | "circumstance" | "untyped";

type TypedMods = {
  statusBonus: number;
  statusPenalty: number;
  circumstanceBonus: number;
  circumstancePenalty: number;
  untyped: number;
};

export type ConditionActionLocks = {
  disableAllActions: boolean;
  disableMove: boolean;
  disableAttack: boolean;
  disableManipulate: boolean;
  disableConcentrate: boolean;
  disableReaction: boolean;
};

export type ConditionEffects = ConditionActionLocks & {
  ac: number;
  fort: number;
  reflex: number;
  will: number;
  perception: number;
  classDc: number;
  maxHpDelta: number;
  speedDelta: number;
  attributeDelta: Record<AttributeKey, number>;
  skillDelta: Record<string, number>;
  finesseMeleeAttack: number;
  rangedAttack: number;
  strMeleeAttack: number;
  sensesDisabled: boolean;
  dyingMax: number;
};

const EMPTY_TYPED: TypedMods = {
  statusBonus: 0,
  statusPenalty: 0,
  circumstanceBonus: 0,
  circumstancePenalty: 0,
  untyped: 0,
};

function newTyped(): TypedMods {
  return { ...EMPTY_TYPED };
}

function addPenalty(mods: TypedMods, type: PenaltyType, value: number) {
  if (value >= 0) return;
  if (type === "untyped") {
    mods.untyped += value;
    return;
  }
  if (type === "status") {
    mods.statusPenalty = Math.min(mods.statusPenalty, value);
  } else {
    mods.circumstancePenalty = Math.min(mods.circumstancePenalty, value);
  }
}

function total(mods: TypedMods): number {
  return (
    mods.statusBonus +
    mods.statusPenalty +
    mods.circumstanceBonus +
    mods.circumstancePenalty +
    mods.untyped
  );
}

export function conditionValue(conditions: ActiveCondition[], id: string): number {
  const active = getActiveCondition(conditions, id);
  if (!active) return 0;
  return active.value ?? 1;
}

export function hasCondition(conditions: ActiveCondition[], id: string): boolean {
  return getActiveCondition(conditions, id) != null;
}

/**
 * Nested conditions from AoN (Grabbed → Off-Guard + Immobilized, Encumbered → Clumsy 1, etc.).
 * @see https://2e.aonsrd.com/conditions
 */
export function expandImpliedConditions(conditions: ActiveCondition[]): ActiveCondition[] {
  const map = new Map<string, ActiveCondition>();
  for (const condition of conditions) {
    map.set(condition.id, { ...condition });
  }

  const ensure = (id: string, value?: number) => {
    const existing = map.get(id);
    if (!existing) {
      map.set(id, value != null ? { id, value } : { id });
      return true;
    }
    if (value != null && isValuedCondition(id)) {
      const next = Math.max(existing.value ?? 1, value);
      if (next !== (existing.value ?? 1)) {
        map.set(id, { id, value: next });
        return true;
      }
    }
    return false;
  };

  let changed = true;
  while (changed) {
    changed = false;
    if (map.has("dying")) changed = ensure("unconscious") || changed;
    if (map.has("unconscious")) {
      changed = ensure("blinded") || changed;
      changed = ensure("off-guard") || changed;
      changed = ensure("prone") || changed;
    }
    if (map.has("grabbed") || map.has("restrained")) {
      changed = ensure("off-guard") || changed;
      changed = ensure("immobilized") || changed;
    }
    if (map.has("confused") || map.has("paralyzed")) {
      changed = ensure("off-guard") || changed;
    }
    if (map.has("encumbered")) changed = ensure("clumsy", 1) || changed;
    if (map.has("flat-footed")) changed = ensure("off-guard") || changed;
    if (map.has("blinded")) changed = ensure("dazzled") || changed;
  }

  return [...map.values()];
}

/** Tags for conditions implied by another active condition (e.g. Grabbed hides Off-Guard). */
export function conditionsHiddenByOthers(conditions: ActiveCondition[]): Set<string> {
  const hidden = new Set<string>();
  for (const condition of conditions) {
    for (const parent of conditions) {
      if (parent.id === condition.id) continue;
      if (expandImpliedConditions([parent]).some((implied) => implied.id === condition.id)) {
        hidden.add(condition.id);
        break;
      }
    }
  }
  return hidden;
}

export function visibleConditionTags(conditions: ActiveCondition[]): ActiveCondition[] {
  const hidden = conditionsHiddenByOthers(conditions);
  return conditions.filter((condition) => !hidden.has(condition.id));
}

export function drainedHpReduction(conditions: ActiveCondition[], level: number): number {
  const drained = conditionValue(conditions, "drained");
  if (drained <= 0) return 0;
  return Math.max(1, level) * drained;
}

export function effectiveMaxHp(baseMaxHp: number, conditions: ActiveCondition[], level: number): number {
  return Math.max(1, baseMaxHp - drainedHpReduction(conditions, level));
}

export function adjustCurrentHpForDrainedChange(
  previous: ActiveCondition[],
  next: ActiveCondition[],
  currentHp: number,
  level: number,
  baseMaxHp: number,
): number {
  const prevLoss = drainedHpReduction(previous, level);
  const nextLoss = drainedHpReduction(next, level);
  let hp = currentHp;
  if (nextLoss > prevLoss) {
    hp -= nextLoss - prevLoss;
  }
  return Math.max(0, Math.min(hp, effectiveMaxHp(baseMaxHp, next, level)));
}

/** Doomed/drained each decrease by 1 after a full night's rest. */
export function tickRestConditions(conditions: ActiveCondition[]): ActiveCondition[] {
  const next: ActiveCondition[] = [];
  for (const condition of conditions) {
    if (condition.id === "fatigued") continue;
    if (condition.id === "doomed" || condition.id === "drained") {
      const value = (condition.value ?? 1) - 1;
      if (value > 0) next.push({ id: condition.id, value });
      continue;
    }
    next.push(condition);
  }
  return next;
}

function allCheckPenalty(conditions: ActiveCondition[]): number {
  return Math.min(-conditionValue(conditions, "frightened"), -conditionValue(conditions, "sickened"), 0);
}

/** Effective attribute modifier after condition-based reductions (enfeebled, clumsy, stupefied). */
export function effectiveAttributeModifier(base: number, delta: number): number {
  return base + delta;
}

export function effectiveAttributes(
  base: Record<AttributeKey, number>,
  attributeDelta: Record<AttributeKey, number>,
): Record<AttributeKey, number> {
  return {
    STR: effectiveAttributeModifier(base.STR, attributeDelta.STR),
    DEX: effectiveAttributeModifier(base.DEX, attributeDelta.DEX),
    CON: effectiveAttributeModifier(base.CON, attributeDelta.CON),
    INT: effectiveAttributeModifier(base.INT, attributeDelta.INT),
    WIS: effectiveAttributeModifier(base.WIS, attributeDelta.WIS),
    CHA: effectiveAttributeModifier(base.CHA, attributeDelta.CHA),
  };
}

/** Sheet stats rebuilt from effective attribute modifiers plus non-attribute condition penalties. */
export function runtimeDerivedStats(
  snapshot: Pick<LevelSnapshot, "level" | "attributes" | "ac" | "fort" | "reflex" | "will" | "perception" | "classDc">,
  effects: ConditionEffects,
) {
  const attributes = effectiveAttributes(snapshot.attributes, effects.attributeDelta);
  const saves = savingThrows(attributes, snapshot.level);

  return {
    ac: armorClass(attributes.DEX, snapshot.level) + effects.ac,
    perception: perception(attributes.WIS, snapshot.level) + effects.perception,
    classDc: classDc(attributes.DEX, snapshot.level) + effects.classDc,
    fort: saves.fort + effects.fort,
    reflex: saves.reflex + effects.reflex,
    will: saves.will + effects.will,
  };
}

/**
 * Numeric and action effects that can be shown on the sheet.
 * Status/circumstance penalties of the same type do not stack (worst applies).
 * @see https://2e.aonsrd.com/conditions
 */
export function resolveConditionEffects(
  rawConditions: ActiveCondition[],
  snapshot: Pick<LevelSnapshot, "level" | "maxHp">,
  skillAttributes: Record<string, AttributeKey>,
): ConditionEffects {
  const conditions = expandImpliedConditions(rawConditions);
  const has = (id: string) => hasCondition(conditions, id);
  const value = (id: string) => conditionValue(conditions, id);

  const allChecks = allCheckPenalty(conditions);
  const clumsy = -value("clumsy");
  const enfeebled = -value("enfeebled");
  const stupefied = -value("stupefied");
  const fascinated = has("fascinated") ? -2 : 0;
  const fatigued = has("fatigued") ? -1 : 0;
  const blindedPerception = has("blinded") ? -4 : 0;
  const deafenedPerception = has("deafened") ? -2 : 0;
  const unconsciousDefenses = has("unconscious") ? -4 : 0;

  const ac = newTyped();
  addPenalty(ac, "status", allChecks);
  addPenalty(ac, "status", fatigued);
  addPenalty(ac, "status", unconsciousDefenses);
  if (has("off-guard")) addPenalty(ac, "circumstance", -2);

  const fort = newTyped();
  addPenalty(fort, "status", allChecks);
  addPenalty(fort, "status", -value("drained"));
  addPenalty(fort, "status", fatigued);

  const reflex = newTyped();
  addPenalty(reflex, "status", allChecks);
  addPenalty(reflex, "status", fatigued);
  addPenalty(reflex, "status", unconsciousDefenses);

  const will = newTyped();
  addPenalty(will, "status", allChecks);
  addPenalty(will, "status", fatigued);

  const perceptionMods = newTyped();
  addPenalty(perceptionMods, "status", allChecks);
  addPenalty(perceptionMods, "status", fascinated);
  addPenalty(perceptionMods, "status", blindedPerception);
  addPenalty(perceptionMods, "status", deafenedPerception);
  addPenalty(perceptionMods, "status", unconsciousDefenses);

  const classDcMods = newTyped();
  addPenalty(classDcMods, "status", allChecks);

  const finesseMeleeAttack = newTyped();
  addPenalty(finesseMeleeAttack, "status", allChecks);
  if (has("prone")) addPenalty(finesseMeleeAttack, "circumstance", -2);

  const rangedAttack = newTyped();
  addPenalty(rangedAttack, "status", allChecks);
  if (has("prone")) addPenalty(rangedAttack, "circumstance", -2);

  const strMeleeAttack = newTyped();
  addPenalty(strMeleeAttack, "status", allChecks);
  if (has("prone")) addPenalty(strMeleeAttack, "circumstance", -2);

  const attributeDelta: Record<AttributeKey, number> = {
    STR: enfeebled,
    DEX: clumsy,
    CON: 0,
    INT: stupefied,
    WIS: stupefied,
    CHA: stupefied,
  };

  const skillDelta: Record<string, number> = {};
  for (const [name, attribute] of Object.entries(skillAttributes)) {
    const skill = newTyped();
    addPenalty(skill, "status", allChecks);
    addPenalty(skill, "status", fascinated);
    if (attribute === "CON") addPenalty(skill, "status", -value("drained"));
    skillDelta[name] = total(skill);
  }

  const immobilized = has("immobilized");
  const restrained = has("restrained");
  const cannotAct = has("unconscious") || has("paralyzed") || has("stunned") || has("dying");

  return {
    ac: total(ac),
    fort: total(fort),
    reflex: total(reflex),
    will: total(will),
    perception: total(perceptionMods),
    classDc: total(classDcMods),
    maxHpDelta: -drainedHpReduction(conditions, snapshot.level),
    speedDelta: has("encumbered") ? -10 : 0,
    attributeDelta,
    skillDelta,
    finesseMeleeAttack: total(finesseMeleeAttack),
    rangedAttack: total(rangedAttack),
    strMeleeAttack: total(strMeleeAttack),
    sensesDisabled: has("blinded"),
    dyingMax: Math.max(0, 4 - value("doomed")),
    disableAllActions: cannotAct,
    disableMove: cannotAct || immobilized || has("prone"),
    disableAttack: cannotAct || restrained,
    disableManipulate: cannotAct || restrained,
    disableConcentrate: cannotAct || has("fascinated"),
    disableReaction: cannotAct || has("confused"),
  };
}

export function modifiedSpeed(base: number, speedDelta: number): number {
  if (speedDelta >= 0) return base + speedDelta;
  return Math.max(5, base + speedDelta);
}

export function attackDeltaForStrike(
  effects: ConditionEffects,
  strike: { ranged?: boolean; finesse?: boolean },
): number {
  if (strike.ranged) return effects.rangedAttack;
  if (strike.finesse) return effects.finesseMeleeAttack;
  return effects.strMeleeAttack;
}
