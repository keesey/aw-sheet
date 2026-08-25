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
  const damageLines: DamageRollLine[] = [];

  const weaponRoll = rollDiceNotation(damage.weaponDice);
  damageLines.push({
    label: `${damage.weaponDice} ${formatDamageType(damage.damageType)}`,
    rolls: weaponRoll.rolls,
    modifier: damage.flatBonus,
    subtotal: weaponRoll.total + damage.flatBonus,
  });

  if (damage.preciseStrike > 0) {
    if (damageMode === "finisher") {
      const finisherRoll = rollDiceNotation(damage.finisherDice);
      damageLines.push({
        label: `${damage.finisherDice} precision`,
        rolls: finisherRoll.rolls,
        modifier: 0,
        subtotal: finisherRoll.total,
      });
    } else {
      damageLines.push({
        label: `${damage.preciseStrike} precision`,
        rolls: [],
        modifier: damage.preciseStrike,
        subtotal: damage.preciseStrike,
      });
    }
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
