import type { CharacterSheet } from "@/lib/types";
import { MENTAL_ABILITIES, PHYSICAL_ABILITIES } from "../../lib/constants";
import { formatAbilityMod } from "../../lib/format";
import { BottomPanel } from "../BottomPanel";

export function AbilitiesPanel({
  level,
  onClose,
}: {
  level: CharacterSheet["level"];
  onClose: () => void;
}) {
  return (
    <BottomPanel title="Ability Stats" onClose={onClose}>
      <div className="ability-grid">
        <div className="ability-column">
          <div className="action-group-title">Physical</div>
          {PHYSICAL_ABILITIES.map((key) => (
            <div key={key} className="ability-row">
              <span className="ability-name">{key}</span>
              <strong className="ability-mod">{formatAbilityMod(level.abilities[key])}</strong>
            </div>
          ))}
        </div>
        <div className="ability-column">
          <div className="action-group-title">Mental</div>
          {MENTAL_ABILITIES.map((key) => (
            <div key={key} className="ability-row">
              <span className="ability-name">{key}</span>
              <strong className="ability-mod">{formatAbilityMod(level.abilities[key])}</strong>
            </div>
          ))}
        </div>
      </div>
    </BottomPanel>
  );
}
