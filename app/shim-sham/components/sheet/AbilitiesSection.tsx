import type { AbilityKey, CharacterSheet } from "@/lib/types";
import { MENTAL_ABILITIES, PHYSICAL_ABILITIES } from "../../lib/constants";
import { formatAbilityMod } from "../../lib/format";
import { RollBonusButton } from "../RollBonusButton";

const ABILITY_ORDER: AbilityKey[] = [...PHYSICAL_ABILITIES, ...MENTAL_ABILITIES];

export function AbilitiesSection({ level }: { level: CharacterSheet["level"] }) {
  return (
    <div className="stat-card sheet-section">
      <div className="stat-label" style={{ marginBottom: "0.5rem" }}>
        Abilities
      </div>
      <div className="abilities-compact">
        {ABILITY_ORDER.map((key) => (
          <div key={key} className="ability-compact-item">
            <span className="ability-name">{key}</span>
            <RollBonusButton
              label={`${key} check`}
              bonus={level.abilities[key]}
              className="ability-mod"
            >
              {formatAbilityMod(level.abilities[key])}
            </RollBonusButton>
          </div>
        ))}
      </div>
    </div>
  );
}
