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
import {
  attackDeltaForStrike,
  resolveConditionEffects,
} from "@/lib/shim-sham/condition-effects";
import {
  buildSkillEntries,
  formatSignedBonus,
  getSkillKeyAbilities,
  skillBonusByName,
} from "@/lib/shim-sham/skills";
import { buildWeaponStrikes, formatSkillAttackMapBonus } from "@/lib/shim-sham/strikes";
import {
  formatStylishCombatantBonus,
} from "@/lib/shim-sham/stylish-combatant";

const AON = "https://2e.aonsrd.com";
const AONP = "https://2e.aonprd.com";

export const FORCE_FIELD_MAX_HP = 6;
export const FORCE_FIELD_DAILY_USES = 3;
export const FORCE_FIELD_REGEN_PER_TURN = 2;

export function createDefaultRuntime(level = 6): RuntimeState {
  const snapshot = getLevelSnapshot(level)!;
  return {
    level,
    currentHp: snapshot.maxHp,
    panache: false,
    accelerate: false,
    jetpack: false,
    combat: false,
    duelingParry: false,
    batonParry: false,
    cover: "none",
    credits: 1280,
    conditions: [],
    forceFieldHp: 0,
    forceFieldUsesUsed: 0,
    forceFieldActive: false,
    meyelRerollUsed: false,
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
  const level = getLevelSnapshot(runtime.level)!;
  const conditions = syncEncumberedFromBulk(
    normalizeConditions(runtime.conditions),
    inventoryTotalBulk(SHIM_SHAM_INVENTORY, SHIM_SHAM_CONSUMABLES, runtime),
    level.abilities.STR,
  );
  const forceFieldHp = Math.max(0, runtime.forceFieldHp);
  const forceFieldActive = runtime.forceFieldActive && forceFieldHp > 0;
  return {
    ...runtime,
    batonParry: runtime.batonParry ?? false,
    cover: runtime.cover ?? "none",
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
    getSkillKeyAbilities(),
  );
  const allSkills = buildSkillEntries(level).map((skill) => ({
    ...skill,
    bonus: skill.bonus + (effects.skillDelta[skill.name] ?? 0),
  }));
  const skillBonus = (name: string) => formatSignedBonus(skillBonusByName(allSkills, name));
  const attackMapBonus = (bonus: string) => formatSkillAttackMapBonus(bonus);
  const weapons = buildWeaponStrikes(level, {
    attackDelta: (strike) => attackDeltaForStrike(effects, strike),
    strDamageDelta: effects.strDamage,
  });
  const armor = getWornArmor(level.level);
  const stylishBonus = formatStylishCombatantBonus(level.level);
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
          id: "exemplary-finisher",
          name: "Exemplary Finisher (Step)",
          cost: "free",
          description: actionDescription("exemplary-finisher"),
          url: `${AONP}/Styles.aspx?ID=7`,
          minLevel: 9,
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
          id: "area-fire-grenade",
          name: "Area Fire",
          cost: "double",
          description: actionDescription("area-fire-grenade"),
          traits: ["Area", "Attack"],
          url: `${AON}/actions/17-area-fire`,
          control: "area-weapons",
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
          id: "dirty-trick",
          name: "Dirty Trick",
          cost: "single",
          description: actionDescription("dirty-trick"),
          traits: ["Attack", "Manipulate", "Skill"],
          url: `${AONP}/Feats.aspx?ID=6472`,
          bonus: attackMapBonus(skillBonus("Thievery")),
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

  return {
    static: {
      name: "Jenluwess Wivvashimmeh",
      nickname: "Shim Sham",
      player: "Keesey",
      deity: "Meyel",
      ancestry: { name: "Pahtra", url: `${AON}/ancestries/12-pahtra` },
      heritage: {
        name: "Meyel's Chosen",
        url: `${AON}/ancestries/12-pahtra/heritages/52-meyels-chosen-pahtra`,
      },
      background: { name: "Space Pirate", url: `${AON}/backgrounds/32-space-pirate` },
      class: { name: "Swashbuckler 6", url: `${AONP}/Classes.aspx?ID=63` },
      style: { name: "Battledancer", url: `${AONP}/Styles.aspx?ID=7` },
      size: "Medium",
      languages: ["Common", "Pahtra", "Vesk"],
      homeWorld: "Pulonis",
      portOfCall: "Absalom Station",
      senses: [{ name: "Darkvision", url: `${AON}/rules/459-darkvision-and-greater-darkvision` }],
      anathema: ["Look clumsy (never do)", "Reveal secretive Pahtra names"],
      armor: {
        name: armor.name,
        url: armor.url,
        acBonus: armor.acBonus,
        notes: armor.notes,
      },
      resistances: ["Reroll crit fail on save 1×/day (Meyel's Chosen)"],
      skills: allSkills.filter((skill) => skill.proficiency !== "U"),
      weapons,
      actions: allActions.filter((action) => level.level >= (action.minLevel ?? 1)),
      inventory: SHIM_SHAM_INVENTORY,
      consumableCatalog: SHIM_SHAM_CONSUMABLES,
      planUrl: "https://gist.github.com/keesey/7ae2c20287b0555a44d3f910eecb4530",
      playbookUrl: "https://gist.github.com/keesey/2c6a5bb30f1ccc30e4d4b7fe3e1c7e78",
    },
    level,
    runtime: normalizedRuntime,
  };
}
