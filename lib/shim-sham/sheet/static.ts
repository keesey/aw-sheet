import type { CharacterSheet, RuntimeState } from "@/lib/types";
import { buildShimShamActions, KIP_UP_MIN_LEVEL } from "@/lib/shim-sham/data/actions-data";
import { AON, AONP } from "@/lib/shim-sham/aon";
import { formatSigned } from "@/lib/format-signed";
import { requireLevelSnapshot } from "@/lib/shim-sham/data/progression";
import { normalizeConditions } from "@/lib/shim-sham/rules/conditions";
import { normalizeAdHocItems, syncEncumberedFromBulk } from "@/lib/shim-sham/data/bulk";
import {
  inventoryTotalBulk,
  SHIM_SHAM_AMMUNITION,
  SHIM_SHAM_CONSUMABLES,
  SHIM_SHAM_INVENTORY,
} from "@/lib/shim-sham/data/inventory";
import { getWornArmor } from "@/lib/shim-sham/rules/armor";
import { perception } from "@/lib/shim-sham/rules/perception";
import {
  attackDeltaForStrike,
  effectiveAttributes,
  effectiveAttributeModifier,
  resolveConditionEffects,
  runtimeDerivedStats,
} from "@/lib/shim-sham/rules/condition-effects";
import {
  buildSkillEntries,
  getSkillKeyAttributes,
  skillBonusByName,
} from "@/lib/shim-sham/rules/skills";
import { buildWeaponStrikes, formatEscapeMapBonus, formatSkillAttackMapBonus } from "@/lib/shim-sham/rules/strikes";
import {
  formatStylishCombatantBonus,
} from "@/lib/shim-sham/rules/stylish-combatant";

export const FORCE_FIELD_MAX_HP = 6;
export const FORCE_FIELD_DAILY_USES = 3;
export const FORCE_FIELD_REGEN_PER_TURN = 2;

export function createDefaultRuntime(level = 1): RuntimeState {
  const snapshot = requireLevelSnapshot(level);
  return {
    level,
    currentHp: snapshot.maxHp,
    panache: false,
    accelerate: false,
    jetpack: false,
    encounter: false,
    duelingParry: false,
    batonParry: false,
    cover: "none",
    credits: 0,
    conditions: [],
    forceFieldHp: 0,
    forceFieldUsesUsed: 0,
    forceFieldActive: false,
    meyelRerollUsed: false,
    preparedToAid: false,
    delayed: false,
    consumables: {
      "medpatch-tactical": 0,
      "medpatch-commercial": 0,
      "celebrity-serum": 0,
      "incendiary-grenade": 0,
    },
    batteries: [
      { id: "battery-1", charges: 10, max: 10 },
      { id: "battery-2", charges: 10, max: 10 },
    ],
    chemTankCharges: 8,
    breachingGunMagazine: SHIM_SHAM_AMMUNITION.breachingGun.magazineMax,
    notes: "",
    adHocItems: [],
  };
}

export function normalizeRuntimeState(runtime: RuntimeState): RuntimeState {
  const legacy = runtime as RuntimeState & { combat?: boolean };
  const level = requireLevelSnapshot(runtime.level);
  const normalizedConditions = normalizeConditions(runtime.conditions);
  const effects = resolveConditionEffects(
    normalizedConditions,
    level,
    getSkillKeyAttributes(),
  );
  const effectiveStr = effectiveAttributeModifier(
    level.attributes.STR,
    effects.attributeDelta.STR,
  );
  const conditions = syncEncumberedFromBulk(
    normalizedConditions,
    inventoryTotalBulk(SHIM_SHAM_INVENTORY, SHIM_SHAM_CONSUMABLES, runtime),
    effectiveStr,
  );
  const forceFieldHp = Math.max(0, runtime.forceFieldHp);
  const forceFieldActive = runtime.forceFieldActive && forceFieldHp > 0;
  return {
    ...runtime,
    encounter: runtime.encounter ?? legacy.combat ?? false,
    batonParry: runtime.batonParry ?? false,
    cover: runtime.cover ?? "none",
    preparedToAid: runtime.preparedToAid ?? false,
    delayed: runtime.delayed ?? false,
    forceFieldActive,
    forceFieldHp,
    breachingGunMagazine: Math.min(
      SHIM_SHAM_AMMUNITION.breachingGun.magazineMax,
      Math.max(
        0,
        runtime.breachingGunMagazine ?? SHIM_SHAM_AMMUNITION.breachingGun.magazineMax,
      ),
    ),
    adHocItems: normalizeAdHocItems(runtime.adHocItems),
    conditions,
  };
}

export function buildCharacterSheet(runtime: RuntimeState): CharacterSheet {
  const normalizedRuntime = normalizeRuntimeState(runtime);
  const level = requireLevelSnapshot(normalizedRuntime.level);
  const effects = resolveConditionEffects(
    normalizedRuntime.conditions,
    level,
    getSkillKeyAttributes(),
  );
  const effectiveLevel = {
    ...level,
    attributes: effectiveAttributes(level.attributes, effects.attributeDelta),
  };
  const allSkills = buildSkillEntries(effectiveLevel).map((skill) => ({
    ...skill,
    bonus: skill.bonus + (effects.skillDelta[skill.name] ?? 0),
  }));
  const skillBonus = (name: string) => formatSigned(skillBonusByName(allSkills, name));
  const attackMapBonus = (bonus: string) => formatSkillAttackMapBonus(bonus);
  const acrobaticsSkill = allSkills.find((skill) => skill.name === "Acrobatics");
  if (!acrobaticsSkill) {
    throw new Error("Acrobatics skill missing from character build");
  }
  const escapeMapBonus = formatEscapeMapBonus(
    acrobaticsSkill.bonus,
    acrobaticsSkill.proficiency,
    effectiveLevel.level,
  );
  const weapons = buildWeaponStrikes(effectiveLevel, {
    attackDelta: (strike) => attackDeltaForStrike(effects, strike),
  });
  const armor = getWornArmor(level.level);
  const stylishBonus = formatStylishCombatantBonus(level.level);
  const perceptionBonus = formatSigned(
    perception(effectiveLevel.attributes.WIS, effectiveLevel.level) + effects.perception,
  );
  const derived = runtimeDerivedStats(level, effects);
  const grabAnEdgeBonus = formatSigned(
    Math.max(derived.reflex, acrobaticsSkill.bonus),
  );
  const fortBonus = formatSigned(derived.fort);
  const allActions = buildShimShamActions({
    skillBonus,
    attackMapBonus,
    escapeMapBonus,
    grabAnEdgeBonus,
    fortBonus,
    perceptionBonus,
    stylishBonus,
  });

  const { feats: _feats, preciseStrike: _preciseStrike, ...levelForClient } = level;

  return {
    static: {
      name: "Jenluwess Wivvashimmeh",
      nickname: "Shim Sham",
      deity: { name: "Meyel", url: `${AON}/deities/11-meyel` },
      ancestry: { name: "Pahtra", url: `${AON}/ancestries/12-pahtra` },
      heritage: {
        name: "Meyel's Chosen",
        url: `${AON}/ancestries/12-pahtra/heritages/52-meyels-chosen-pahtra`,
      },
      background: { name: "Space Pirate", url: `${AON}/backgrounds/32-space-pirate` },
      class: { name: "Swashbuckler 6", url: `${AONP}/Classes.aspx?ID=63` },
      style: { name: "Battledancer", url: `${AONP}/Styles.aspx?ID=7` },
      languages: [
        { name: "Common", url: `${AON}/languages/1-common` },
        { name: "Pahtra", url: `${AON}/languages/12-pahtra` },
        { name: "Vesk", url: `${AON}/languages/13-vesk` },
      ],
      homeWorld: { name: "Pulonis", url: `${AON}/planets/26-pulonis` },
      portOfCall: { name: "Absalom Station", url: `${AON}/planets/16-absalom-station` },
      senses: [{ name: "Darkvision", url: `${AON}/rules/459-darkvision-and-greater-darkvision` }],
      anathema: ["Look clumsy (never do).", "Reveal secretive Pahtra name."],
      armor: {
        name: armor.name,
        url: armor.url,
      },
      skills: allSkills.filter((skill) => skill.proficiency !== "U"),
      weapons,
      actions: allActions.filter((action) => {
        if (level.level < (action.minLevel ?? 1)) return false;
        if (action.id === "stand" && level.level >= KIP_UP_MIN_LEVEL) return false;
        return true;
      }),
      inventory: SHIM_SHAM_INVENTORY,
      consumableCatalog: SHIM_SHAM_CONSUMABLES,
      planUrl: "https://gist.github.com/keesey/7ae2c20287b0555a44d3f910eecb4530",
    },
    level: levelForClient,
    runtime: normalizedRuntime,
  };
}
