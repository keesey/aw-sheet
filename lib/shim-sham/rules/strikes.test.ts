import { describe, expect, it } from "vitest";
import type { ActiveCondition } from "@/lib/types";
import { requireLevelSnapshot } from "@/lib/shim-sham/data/progression";
import {
  attackDeltaForStrike,
  effectiveAttributes,
  resolveConditionEffects,
} from "@/lib/shim-sham/rules/condition-effects";
import { getSkillKeyAttributes } from "@/lib/shim-sham/rules/skills";
import {
  buildWeaponStrikes,
  kickbackAttackPenalty,
  kickbackDamageBonus,
} from "@/lib/shim-sham/rules/strikes";

function breachingGunStrike(conditions: ActiveCondition[] = []) {
  const level = requireLevelSnapshot(6);
  const effects = resolveConditionEffects(conditions, level, getSkillKeyAttributes());
  const effectiveLevel = {
    ...level,
    attributes: effectiveAttributes(level.attributes, effects.attributeDelta),
  };
  const weapons = buildWeaponStrikes(effectiveLevel, {
    attackDelta: (strike) => attackDeltaForStrike(effects, strike),
  });
  const strike = weapons.find((weapon) => weapon.id === "breaching-gun");
  if (!strike) throw new Error("Breaching gun strike missing");
  return { strike, effectiveStr: effectiveLevel.attributes.STR };
}

describe("kickback", () => {
  it("ignores attack penalty when effective Strength is +2 or higher", () => {
    expect(kickbackAttackPenalty(2)).toBe(0);
    expect(kickbackAttackPenalty(3)).toBe(0);
  });

  it("applies −2 attack penalty when effective Strength is below +2", () => {
    expect(kickbackAttackPenalty(1)).toBe(-2);
    expect(kickbackAttackPenalty(0)).toBe(-2);
  });

  it("adds +1 damage for kickback weapons", () => {
    expect(kickbackDamageBonus(["Kickback"])).toBe(1);
    expect(kickbackDamageBonus(["Projectile"])).toBe(0);
  });

  it("adds kickback damage without attack penalty at full Strength", () => {
    const { strike, effectiveStr } = breachingGunStrike();
    expect(effectiveStr).toBeGreaterThanOrEqual(2);
    expect(strike.damage).toBe("2d10+1 P (Expend 1)");
    const zeroPistol = buildWeaponStrikes(requireLevelSnapshot(6)).find(
      (weapon) => weapon.id === "zero-pistol",
    );
    expect(strike.mapAttacks[0]).toBe(zeroPistol?.mapAttacks[0]);
  });

  it("applies kickback attack penalty while enfeebled", () => {
    const healthy = breachingGunStrike();
    const enfeebled = breachingGunStrike([{ id: "enfeebled", value: 1 }]);
    expect(enfeebled.effectiveStr).toBe(healthy.effectiveStr - 1);
    expect(enfeebled.strike.mapAttacks[0]).toBe(healthy.strike.mapAttacks[0] - 2);
    expect(enfeebled.strike.damage).toBe(healthy.strike.damage);
  });
});
