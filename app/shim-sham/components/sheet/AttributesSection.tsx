import type { AttributeKey, CharacterSheet } from "@/lib/types";
import { effectiveAttributeModifier } from "@/lib/shim-sham/condition-effects";
import { MENTAL_ATTRIBUTES, PHYSICAL_ATTRIBUTES } from "@/lib/shim-sham/constants";
import { formatAttributeMod, statModClass } from "../../ui/format";
import { RollBonusButton } from "../RollBonusButton";

const ATTRIBUTE_ORDER: AttributeKey[] = [...PHYSICAL_ATTRIBUTES, ...MENTAL_ATTRIBUTES];

export function AttributesSection({
  level,
  attributeDelta,
}: {
  level: CharacterSheet["level"];
  attributeDelta: Record<AttributeKey, number>;
}) {
  return (
    <div className="stat-card sheet-section">
      <div className="attributes-grid">
        {ATTRIBUTE_ORDER.map((key) => {
          const delta = attributeDelta[key] ?? 0;
          const effective = effectiveAttributeModifier(level.attributes[key], delta);

          return (
            <div key={key} className="attribute-stat">
              <span className="stat-label">{key}</span>
              <RollBonusButton
                label={`${key} check`}
                bonus={effective}
                className={`stat-value ${statModClass(delta) ?? ""}`.trim()}
              >
                {formatAttributeMod(effective)}
              </RollBonusButton>
            </div>
          );
        })}
      </div>
    </div>
  );
}
