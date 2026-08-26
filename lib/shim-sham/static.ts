import type { CharacterAction, CharacterSheet, RuntimeState } from "@/lib/types";
import { actionDescription } from "@/lib/shim-sham/action-descriptions";
import { getLevelSnapshot } from "@/lib/shim-sham/progression";
import { normalizeConditions } from "@/lib/shim-sham/conditions";
import { normalizeAdHocItems, syncEncumberedFromBulk } from "@/lib/shim-sham/bulk";
import {
  inventoryTotalBulk,
  SHIM_SHAM_CONSUMABLES,
  SHIM_SHAM_INVENTORY,
} from "@/lib/shim-sham/inventory";
import { getWornArmor } from "@/lib/shim-sham/armor";
import { perception } from "@/lib/shim-sham/perception";
import {
  attackDeltaForStrike,
  effectiveAttributes,
  effectiveAttributeModifier,
  resolveConditionEffects,
  runtimeDerivedStats,
} from "@/lib/shim-sham/condition-effects";
import {
  buildSkillEntries,
  formatSignedBonus,
  getSkillKeyAttributes,
  skillBonusByName,
} from "@/lib/shim-sham/skills";
import { buildWeaponStrikes, formatEscapeMapBonus, formatSkillAttackMapBonus } from "@/lib/shim-sham/strikes";
import {
  formatStylishCombatantBonus,
} from "@/lib/shim-sham/stylish-combatant";

const AON = "https://2e.aonsrd.com";
const AONP = "https://2e.aonprd.com";

export const FORCE_FIELD_MAX_HP = 6;
export const FORCE_FIELD_DAILY_USES = 3;
export const FORCE_FIELD_REGEN_PER_TURN = 2;

export function createDefaultRuntime(level = 1): RuntimeState {
  const snapshot = getLevelSnapshot(level)!;
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
    notes: "",
    adHocItems: [],
  };
}

export function normalizeRuntimeState(runtime: RuntimeState): RuntimeState {
  const legacy = runtime as RuntimeState & { combat?: boolean };
  const level = getLevelSnapshot(runtime.level)!;
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
    adHocItems: normalizeAdHocItems(runtime.adHocItems),
    conditions,
  };
}

export function buildCharacterSheet(runtime: RuntimeState): CharacterSheet {
  const normalizedRuntime = normalizeRuntimeState(runtime);
  const level = getLevelSnapshot(normalizedRuntime.level)!;
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
  const skillBonus = (name: string) => formatSignedBonus(skillBonusByName(allSkills, name));
  const attackMapBonus = (bonus: string) => formatSkillAttackMapBonus(bonus);
  const acrobaticsSkill = allSkills.find((skill) => skill.name === "Acrobatics")!;
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
  const perceptionBonus = formatSignedBonus(
    perception(effectiveLevel.attributes.WIS, effectiveLevel.level) + effects.perception,
  );
  const derived = runtimeDerivedStats(level, effects);
  const grabAnEdgeBonus = formatSignedBonus(
    Math.max(derived.reflex, acrobaticsSkill.bonus),
  );
  const fortBonus = formatSignedBonus(derived.fort);
  const allActions: CharacterAction[] = [
        {
          id: "cardiac-accelerator",
          name: "Activate — Cardiac Accelerator",
          cost: "free",
          description: actionDescription("cardiac-accelerator"),
          traits: ["Tech"],
          url: `${AON}/treasure/130`,
          control: "accelerate",
        },
        {
          id: "delay",
          name: "Delay",
          cost: "free",
          description: actionDescription("delay"),
          url: `${AON}/actions/3-delay`,
          control: "delay",
        },
        {
          id: "exemplary-finisher",
          name: "Exemplary Finisher (Step)",
          cost: "free",
          description: actionDescription("exemplary-finisher"),
          url: `${AONP}/Styles.aspx?ID=7`,
          minLevel: 9,
        },
        {
          id: "return-to-initiative",
          name: "Return to Initiative Order",
          cost: "free",
          description: actionDescription("return-to-initiative"),
          url: `${AON}/actions/3-delay`,
          control: "return-to-initiative",
        },
        {
          id: "release",
          name: "Release",
          cost: "free",
          description: actionDescription("release"),
          traits: ["Manipulate"],
          url: `${AON}/actions/9-release`,
        },
        {
          id: "meyel-reroll",
          name: "Reroll Save — Meyel's Chosen Pahtra",
          cost: "free",
          description: actionDescription("meyel-reroll"),
          traits: ["Fortune"],
          url: `${AON}/ancestries/12-pahtra/heritages/52-meyels-chosen-pahtra`,
          control: "meyel-reroll",
        },
        {
          id: "aid",
          name: "Aid",
          cost: "reaction",
          description: actionDescription("aid"),
          url: `${AON}/actions/1-aid`,
          control: "aid",
        },
        {
          id: "arrest-a-fall",
          name: "Arrest a Fall",
          cost: "reaction",
          description: actionDescription("arrest-a-fall"),
          url: `${AON}/actions/18-arrest-a-fall`,
        },
        {
          id: "grab-an-edge",
          name: "Grab an Edge",
          cost: "reaction",
          description: actionDescription("grab-an-edge"),
          traits: ["Manipulate"],
          url: `${AON}/actions/24-grab-an-edge`,
          bonus: grabAnEdgeBonus,
        },
        {
          id: "opportune-riposte",
          name: "Opportune Riposte",
          cost: "reaction",
          description: actionDescription("opportune-riposte"),
          traits: ["Bravado", "Swashbuckler"],
          url: `${AONP}/Actions.aspx?ID=2819`,
          control: "strikes",
        },
        {
          id: "force-field",
          name: "Activate — Force Field",
          cost: "single",
          description: actionDescription("force-field"),
          traits: ["Manipulate"],
          url: `${AON}/treasure/57`,
          control: "force-field",
        },
        {
          id: "jetpack",
          name: "Activate — Jetpack",
          cost: "single",
          description: actionDescription("jetpack"),
          traits: ["Manipulate", "Move"],
          url: `${AON}/treasure/59-jetpack`,
          control: "jetpack",
        },
        {
          id: "dismiss-jetpack",
          name: "Dismiss — Jetpack",
          cost: "single",
          description: actionDescription("dismiss-jetpack"),
          traits: ["Concentrate"],
          url: `${AON}/actions/22-dismiss`,
          control: "jetpack",
        },
        {
          id: "area-fire-grenade",
          name: "Area Fire",
          cost: "double",
          description: actionDescription("area-fire-grenade"),
          traits: ["Area", "Attack"],
          url: `${AON}/actions/17-area-fire`,
          control: "area-weapons",
        },
        {
          id: "ready",
          name: "Ready",
          cost: "double",
          description: actionDescription("ready"),
          traits: ["Concentrate"],
          url: `${AON}/actions/8-ready`,
        },
        {
          id: "avert-gaze",
          name: "Avert Gaze",
          cost: "single",
          description: actionDescription("avert-gaze"),
          url: `${AON}/actions/20-avert-gaze`,
        },
        {
          id: "confident-finisher",
          name: "Confident Finisher",
          cost: "single",
          description: actionDescription("confident-finisher"),
          traits: ["Finisher", "Swashbuckler"],
          url: `${AONP}/Actions.aspx?ID=2818`,
          control: "strikes",
        },
        {
          id: "crawl",
          name: "Crawl",
          cost: "single",
          description: actionDescription("crawl"),
          traits: ["Move"],
          url: `${AON}/actions/2-crawl`,
        },
        {
          id: "dirty-trick",
          name: "Dirty Trick",
          cost: "single",
          description: actionDescription("dirty-trick"),
          traits: ["Attack", "Manipulate", "Skill"],
          url: `${AONP}/Feats.aspx?ID=6472`,
          bonus: attackMapBonus(skillBonus("Thievery")),
        },
        {
          id: "drop-prone",
          name: "Drop Prone",
          cost: "single",
          description: actionDescription("drop-prone"),
          traits: ["Move"],
          url: `${AON}/actions/4-drop-prone`,
          control: "drop-prone",
        },
        {
          id: "dueling-parry",
          name: "Dueling Parry",
          cost: "single",
          description: actionDescription("dueling-parry"),
          url: `${AONP}/Feats.aspx?ID=4781`,
          control: "dueling-parry",
        },
        {
          id: "escape",
          name: "Escape",
          cost: "single",
          description: actionDescription("escape"),
          traits: ["Attack"],
          url: `${AON}/actions/5-escape`,
          bonus: escapeMapBonus,
        },
        {
          id: "fly",
          name: "Fly",
          cost: "single",
          description: actionDescription("fly"),
          traits: ["Move"],
          url: `${AON}/actions/23-fly`,
        },
        {
          id: "grapple",
          name: "Grapple",
          cost: "single",
          description: actionDescription("grapple"),
          traits: ["Attack"],
          url: `${AON}/actions/64-grapple`,
          bonus: attackMapBonus(skillBonus("Athletics")),
        },
        {
          id: "interact",
          name: "Interact",
          cost: "single",
          description: actionDescription("interact"),
          traits: ["Manipulate"],
          url: `${AON}/actions/6-interact`,
        },
        {
          id: "leading-dance",
          name: "Leading Dance",
          cost: "single",
          description: actionDescription("leading-dance"),
          traits: ["Bravado", "Move", "Swashbuckler"],
          url: `${AONP}/Feats.aspx?ID=6149`,
          bonus: skillBonus("Performance"),
          combatBonus: stylishBonus,
        },
        {
          id: "leap",
          name: "Leap",
          cost: "single",
          description: actionDescription("leap"),
          traits: ["Move"],
          url: `${AON}/actions/7-leap`,
        },
        {
          id: "baton-parry",
          name: "Parry — Baton (Tactical)",
          cost: "single",
          description: actionDescription("baton-parry"),
          url: `${AON}/traits/137-parry`,
          control: "baton-parry",
        },
        {
          id: "perform",
          name: "Perform — Fascinating Performance",
          cost: "single",
          description: actionDescription("perform"),
          traits: ["Bravado", "Concentrate", "Incapacitation"],
          url: `${AONP}/Feats.aspx?ID=5147`,
          bonus: skillBonus("Performance"),
          combatBonus: stylishBonus,
        },
        {
          id: "point-out",
          name: "Point Out",
          cost: "single",
          description: actionDescription("point-out"),
          traits: ["Auditory", "Manipulate", "Visual"],
          url: `${AON}/actions/26-point-out`,
        },
        {
          id: "prepare-to-aid",
          name: "Prepare to Aid",
          cost: "single",
          description: actionDescription("prepare-to-aid"),
          url: `${AON}/actions/1-aid`,
          control: "prepare-to-aid",
        },
        {
          id: "retch",
          name: "Retch",
          cost: "single",
          description: actionDescription("retch"),
          url: `${AON}/conditions/35-sickened`,
          bonus: fortBonus,
        },
        {
          id: "seek",
          name: "Seek",
          cost: "single",
          description: actionDescription("seek"),
          traits: ["Concentrate", "Secret"],
          url: `${AON}/actions/10-seek`,
          bonus: perceptionBonus,
        },
        {
          id: "sense-motive",
          name: "Sense Motive",
          cost: "single",
          description: actionDescription("sense-motive"),
          traits: ["Concentrate", "Secret"],
          url: `${AON}/actions/11-sense-motive`,
          bonus: perceptionBonus,
        },
        {
          id: "stand",
          name: "Stand",
          cost: "single",
          description: actionDescription("stand"),
          traits: ["Move"],
          url: `${AON}/actions/12-stand`,
          control: "stand",
        },
        {
          id: "step",
          name: "Step",
          cost: "single",
          description: actionDescription("step"),
          traits: ["Move"],
          url: `${AON}/actions/13-step`,
        },
        {
          id: "stride",
          name: "Stride",
          cost: "single",
          description: actionDescription("stride"),
          traits: ["Move"],
          url: `${AON}/actions/14-stride`,
        },
        {
          id: "take-cover",
          name: "Take Cover",
          cost: "single",
          description: actionDescription("take-cover"),
          url: `${AONP}/Actions.aspx?ID=2307`,
          control: "take-cover",
        },
        {
          id: "tumble-through",
          name: "Tumble Through",
          cost: "single",
          description: actionDescription("tumble-through"),
          traits: ["Bravado", "Move"],
          url: `${AONP}/Actions.aspx?ID=2370`,
          bonus: skillBonus("Acrobatics"),
          combatBonus: stylishBonus,
        },
  ];

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
      actions: allActions.filter((action) => level.level >= (action.minLevel ?? 1)),
      inventory: SHIM_SHAM_INVENTORY,
      consumableCatalog: SHIM_SHAM_CONSUMABLES,
      planUrl: "https://gist.github.com/keesey/7ae2c20287b0555a44d3f910eecb4530",
    },
    level: levelForClient,
    runtime: normalizedRuntime,
  };
}
