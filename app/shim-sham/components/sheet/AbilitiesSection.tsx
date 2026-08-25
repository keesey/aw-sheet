import type { AbilityKey, CharacterSheet } from "@/lib/types";
import { effectiveAbilityModifier } from "@/lib/shim-sham/condition-effects";
import { MENTAL_ABILITIES, PHYSICAL_ABILITIES } from "../../lib/constants";
import { formatAbilityMod, statModClass } from "../../lib/format";
import { RollBonusButton } from "../RollBonusButton";

const ABILITY_ORDER: AbilityKey[] = [...PHYSICAL_ABILITIES, ...MENTAL_ABILITIES];

export function AbilitiesSection({
  level,
  abilityDelta,
}: {
  level: CharacterSheet["level"];
  abilityDelta: Record<AbilityKey, number>;
}) {
  return (
    <div className="stat-card sheet-section">
      <div className="abilities-grid">
        {ABILITY_ORDER.map((key) => {
          const delta = abilityDelta[key] ?? 0;
          const effective = effectiveAbilityModifier(level.abilities[key], delta);

          return (
            <div key={key} className="ability-stat">
              <span className="stat-label">{key}</span>
              <RollBonusButton
                label={`${key} check`}
                bonus={effective}
                className={`stat-value ${statModClass(delta) ?? ""}`.trim()}
              >
                {formatAbilityMod(effective)}
              </RollBonusButton>
            </div>
          );
        })}
      </div>
    </div>
  );
}
