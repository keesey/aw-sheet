import type { CharacterSheet, RuntimeState } from "@/lib/types";
import { getLevelSnapshot } from "@/lib/shim-sham/progression";
import { normalizeConditions } from "@/lib/shim-sham/conditions";
import { syncEncumberedFromBulk, totalBulk } from "@/lib/shim-sham/bulk";
import { SHIM_SHAM_INVENTORY } from "@/lib/shim-sham/inventory";
import { getWornArmor } from "@/lib/shim-sham/armor";
import {
  buildSkillEntries,
  formatSignedBonus,
  skillBonusByName,
} from "@/lib/shim-sham/skills";

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
    credits: 1280,
    conditions: [],
    forceFieldHp: 0,
    forceFieldUsesUsed: 0,
    meyelRerollUsed: false,
    consumables: {
      "medpatch-tactical": 0,
      "medpatch-commercial": 0,
      "resist-energy": 0,
      "celebrity-serum": 0,
      "incendiary-grenade": 0,
    },
    batteries: [
      { id: "battery-1", charges: 10, max: 10 },
      { id: "battery-2", charges: 10, max: 10 },
    ],
    chemTankCharges: 8,
    notes: "",
  };
}

export function normalizeRuntimeState(runtime: RuntimeState): RuntimeState {
  const level = getLevelSnapshot(runtime.level)!;
  const conditions = syncEncumberedFromBulk(
    normalizeConditions(runtime.conditions),
    totalBulk(SHIM_SHAM_INVENTORY),
    level.abilities.STR,
  );
  return { ...runtime, conditions };
}

export function buildCharacterSheet(runtime: RuntimeState): CharacterSheet {
  const normalizedRuntime = normalizeRuntimeState(runtime);
  const level = getLevelSnapshot(normalizedRuntime.level)!;
  const allSkills = buildSkillEntries(level);
  const skillBonus = (name: string) => formatSignedBonus(skillBonusByName(allSkills, name));
  const armor = getWornArmor(level.level);

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
      weapons: [
        {
          id: "baton",
          name: "Baton (Tactical)",
          attack: "+15 / +10 / +5",
          damage: "1d6+2 B +3 precision (+3d6 finisher)",
          traits: ["Club", "Finesse", "Nonlethal", "Parry"],
          url: `${AON}/actions/15-strike`,
          weaponUrl: `${AON}/equipment/weapons/2-baton`,
        },
        {
          id: "battle-ribbon",
          name: "Battle Ribbon",
          attack: "+14 / +9 / +4",
          damage: "1d4+2 S +3 precision (+3d6 finisher)",
          traits: ["Flail", "Finesse", "Nonlethal", "Reach", "Trip"],
          url: `${AON}/actions/15-strike`,
          weaponUrl: `${AON}/equipment/weapons/9-battle-ribbon`,
        },
        {
          id: "jaws",
          name: "Jaws",
          attack: "+14 / +9 / +4",
          damage: "1d6+2 P +3 precision (+3d6 finisher)",
          traits: ["Brawling", "Finesse", "Grapple", "Unarmed"],
          url: `${AON}/actions/15-strike`,
          weaponUrl: `${AON}/feats/331-predatory`,
        },
        {
          id: "rapier",
          name: "Nano-Edge Rapier (Advanced)",
          attack: "+15 / +10 / +5",
          damage: "2d6+2 P +3 precision (+3d6 finisher, +1d8 deadly on crit)",
          traits: ["Sword", "Deadly d8", "Disarm", "Finesse"],
          url: `${AON}/actions/15-strike`,
          weaponUrl: `${AON}/equipment/weapons/17-nano-edge-rapier`,
        },
        {
          id: "tailblade",
          name: "Tailblade (Advanced)",
          attack: "+15 / +11 / +7",
          damage: "2d4+2 S +3 precision (+3d6 finisher; frightened 1 on crit)",
          traits: ["Knife", "Agile", "Finesse", "Free-hand"],
          url: `${AON}/actions/15-strike`,
          weaponUrl: `${AON}/equipment/weapons/29-tailblade`,
        },
        {
          id: "zero-knife",
          name: "Zero Knife",
          attack: "+14 / +10 / +6",
          damage: "1d4+2 C/P +3 precision (+3d6 finisher)",
          traits: ["Knife", "Agile", "Finesse", "Powered", "Versatile P"],
          url: `${AON}/actions/15-strike`,
          weaponUrl: `${AON}/equipment/weapons/7-zero-knife`,
        },
        {
          id: "zero-pistol",
          name: "Zero Pistol (Advanced)",
          attack: "+15 / +10 / +5",
          damage: "2d6 C (Expend 2)",
          traits: ["Tech"],
          url: `${AON}/actions/15-strike`,
          weaponUrl: `${AON}/equipment/weapons/48-zero-pistol`,
        },
      ],
      actions: [
        {
          id: "cardiac-accelerator",
          name: "Activate Cardiac Accelerator",
          cost: "free",
          summary: "+20 ft to a Speed for 1 action/10 minutes. Trigger: Climb, Stride, or Swim.",
          traits: ["Tech"],
          url: `${AON}/treasure/130`,
        },
        {
          id: "exemplary-finisher",
          name: "Exemplary Finisher (Step)",
          cost: "free",
          summary: "Step after a finisher.",
          url: `${AONP}/Styles.aspx?ID=7`,
        },
        {
          id: "meyel-reroll",
          name: "Meyel's Chosen — Reroll Save",
          cost: "free",
          summary: "Reroll a critical failure on a saving throw (1×/day).",
          traits: ["Fortune"],
          url: `${AON}/ancestries/12-pahtra/heritages/52-meyels-chosen-pahtra`,
        },
        {
          id: "opportune-riposte",
          name: "Opportune Riposte",
          cost: "reaction",
          summary:
            "Trigger: An enemy within reach critically fails a Strike against you.",
          traits: ["Bravado", "Swashbuckler"],
          url: `${AONP}/Actions.aspx?ID=2819`,
        },
        {
          id: "force-field",
          name: "Activate Force Field",
          cost: "single",
          summary: "Lasts 1 minute. 6 temp HP, +2 HP/turn. 3×/day.",
          traits: ["Manipulate"],
          url: `${AON}/treasure/57`,
        },
        {
          id: "jetpack",
          name: "Activate Jetpack",
          cost: "single",
          summary: "Lasts 1 minute. Fly speed (see Fly).",
          traits: ["Manipulate", "Move"],
          url: `${AON}/treasure/59-jetpack`,
        },
        {
          id: "area-fire-grenade",
          name: "Area Fire (Grenade)",
          cost: "single",
          summary: "Throw grenade (70 ft); basic Reflex vs. class DC + tracking.",
          traits: ["Area", "Attack"],
          url: `${AON}/actions/17-area-fire`,
        },
        {
          id: "climb",
          name: "Climb",
          cost: "single",
          summary: "Move 30' (35' with panache). See Cardiac Accelerator.",
          traits: ["Move"],
          url: `${AON}/actions/62-climb`,
        },
        {
          id: "confident-finisher",
          name: "Confident Finisher",
          cost: "single",
          summary: "Strike and deal half precision damage on failure.",
          traits: ["Finisher", "Swashbuckler"],
          url: `${AONP}/Classes.aspx?ID=63`,
        },
        {
          id: "dirty-trick",
          name: "Dirty Trick",
          cost: "single",
          summary: "Skill attack.",
          traits: ["Attack", "Manipulate", "Skill"],
          url: `${AONP}/Feats.aspx?ID=6472`,
          bonus: skillBonus("Thievery"),
        },
        {
          id: "dueling-parry",
          name: "Dueling Parry",
          cost: "single",
          summary: "+2 AC while wielding a single one-handed melee weapon.",
          url: `${AONP}/Feats.aspx?ID=4781`,
          bonus: "+2 AC",
        },
        {
          id: "fly",
          name: "Fly",
          cost: "single",
          summary: "Move 25' (30' with panache).",
          traits: ["Move"],
          url: `${AON}/actions/23-fly`,
        },
        {
          id: "grapple",
          name: "Grapple",
          cost: "single",
          summary: "Athletics vs. Fortitude DC.",
          traits: ["Attack"],
          url: `${AON}/actions/64-grapple`,
          bonus: skillBonus("Athletics"),
        },
        {
          id: "leading-dance",
          name: "Leading Dance",
          cost: "single",
          summary: "Bravado move to reposition a foe.",
          traits: ["Bravado", "Move", "Swashbuckler"],
          url: `${AONP}/Feats.aspx?ID=6149`,
          bonus: skillBonus("Performance"),
          combatBonus: "+1",
        },
        {
          id: "baton-parry",
          name: "Parry — Baton (Tactical)",
          cost: "single",
          summary: "+1 AC (see Dueling Parry).",
          url: `${AON}/traits/137-parry`,
          bonus: "+1 AC",
        },
        {
          id: "perform",
          name: "Perform / Fascinating Performance",
          cost: "single",
          summary: "Focused Fascination.",
          traits: ["Bravado", "Concentrate", "Incapacitation"],
          url: `${AONP}/Feats.aspx?ID=5147`,
          bonus: skillBonus("Performance"),
          combatBonus: "+1",
        },
        {
          id: "stride",
          name: "Stride",
          cost: "single",
          summary: "Move 30' (35' with panache). See Cardiac Accelerator.",
          traits: ["Move"],
          url: `${AON}/actions/14-stride`,
        },
        {
          id: "tumble-through",
          name: "Tumble Through",
          cost: "single",
          summary: "Acrobatics to move through a foe's space.",
          traits: ["Bravado", "Move"],
          url: `${AONP}/Actions.aspx?ID=2370`,
          bonus: skillBonus("Acrobatics"),
          combatBonus: "+1",
        },
        {
          id: "group-coercion",
          name: "Group Coercion",
          cost: "minute",
          summary: "Coerce up to 5 targets.",
          url: `${AON}/feats/811-group-coercion`,
        },
      ],
      inventory: SHIM_SHAM_INVENTORY,
      consumableCatalog: [
        {
          id: "medpatch-tactical",
          name: "Medpatch (Tactical)",
          url: `${AON}/treasure/35-medpatch`,
          quantity: 1,
          used: 0,
        },
        {
          id: "medpatch-commercial",
          name: "Medpatch (Commercial)",
          url: `${AON}/treasure/35-medpatch`,
          quantity: 3,
          used: 0,
        },
        {
          id: "resist-energy",
          name: "Resist Energy Spell Ampoule (Commercial)",
          url: `${AON}/treasure/117`,
          quantity: 1,
          used: 0,
        },
        {
          id: "celebrity-serum",
          name: "Celebrity Serum",
          url: `${AON}/treasure/38-celebrity-serum`,
          quantity: 5,
          used: 0,
        },
        {
          id: "incendiary-grenade",
          name: "Incendiary Grenade (Commercial)",
          url: `${AON}/treasure/104-incendiary-grenade`,
          quantity: 1,
          used: 0,
        },
      ],
      planUrl: "https://gist.github.com/keesey/7ae2c20287b0555a44d3f910eecb4530",
      playbookUrl: "https://gist.github.com/keesey/2c6a5bb30f1ccc30e4d4b7fe3e1c7e78",
    },
    level,
    runtime: normalizedRuntime,
  };
}
