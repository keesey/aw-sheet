import type { StrikeDamageProfile } from "@/lib/types";
import type { StrikeDamageMode } from "./strike-format";
import { rollD20, rollDiceNotation, type DamageRollLine } from "./roll";

export type StrikeRollResult = {
  kind: "strike";
  label: string;
  mapIndex: number;
  d20: number;
  bonus: number;
  total: number;
  damageMode: StrikeDamageMode;
  damageLines: DamageRollLine[];
  damageTotal: number;
  critNote?: string;
  critDice?: string;
  isCrit: boolean;
  isFumble: boolean;
};

const DAMAGE_TYPE_NAMES: Record<string, string> = {
  B: "bludgeoning",
  P: "piercing",
  S: "slashing",
  C: "cold",
};

function formatDamageType(type: string): string {
  if (type.includes("/")) {
    return type
      .split("/")
      .map((part) => DAMAGE_TYPE_NAMES[part.trim()] ?? part.trim().toLowerCase())
      .join("/");
  }
  return DAMAGE_TYPE_NAMES[type] ?? type.toLowerCase();
}

function applyCritMultiplier(lines: DamageRollLine[]): DamageRollLine[] {
  return lines.map((line) => ({
    ...line,
    critMultiplier: 2,
    subtotal: line.subtotal * 2,
  }));
}

function buildWeaponDamageLine(damage: StrikeDamageProfile): DamageRollLine {
  const weaponRoll = rollDiceNotation(damage.weaponDice);
  return {
    label: `${damage.weaponDice} ${formatDamageType(damage.damageType)}`,
    rolls: weaponRoll.rolls,
    modifier: damage.flatBonus,
    subtotal: weaponRoll.total + damage.flatBonus,
  };
}

function buildPrecisionLine(
  damage: StrikeDamageProfile,
  damageMode: StrikeDamageMode,
): DamageRollLine | null {
  if (damage.preciseStrike <= 0) return null;

  if (damageMode === "finisher") {
    const finisherRoll = rollDiceNotation(damage.finisherDice);
    return {
      label: `${damage.finisherDice} precision`,
      rolls: finisherRoll.rolls,
      modifier: 0,
      subtotal: finisherRoll.total,
    };
  }

  return {
    label: `${damage.preciseStrike} precision`,
    rolls: [],
    modifier: damage.preciseStrike,
    subtotal: damage.preciseStrike,
  };
}

function appendDeadlyOnCrit(lines: DamageRollLine[], critDice?: string): DamageRollLine[] {
  if (!critDice) return lines;
  const deadlyRoll = rollDiceNotation(critDice);
  return [
    ...lines,
    {
      label: `${critDice} deadly`,
      rolls: deadlyRoll.rolls,
      modifier: 0,
      subtotal: deadlyRoll.total,
    },
  ];
}

export function rollStrikeAttack(
  label: string,
  bonus: number,
  mapIndex: number,
  damage: StrikeDamageProfile,
  damageMode: StrikeDamageMode,
): StrikeRollResult {
  const d20 = rollD20();
  const isCrit = d20 === 20;
  const isFumble = d20 === 1;

  let damageLines = [buildWeaponDamageLine(damage)];
  const precisionLine = buildPrecisionLine(damage, damageMode);
  if (precisionLine) damageLines.push(precisionLine);
  if (isCrit) {
    damageLines = applyCritMultiplier(damageLines);
    damageLines = appendDeadlyOnCrit(damageLines, damage.critDice);
  }

  const damageTotal = damageLines.reduce((sum, line) => sum + line.subtotal, 0);

  return {
    kind: "strike",
    label,
    mapIndex,
    d20,
    bonus,
    total: d20 + bonus,
    damageMode,
    damageLines,
    damageTotal,
    critNote: damage.critNote,
    critDice: damage.critDice,
    isCrit,
    isFumble,
  };
}
