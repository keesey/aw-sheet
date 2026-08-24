import type { ActiveCondition } from "@/lib/types";
import {
  CONDITIONS,
  adjustConditionValue,
  getActiveCondition,
  removeCondition,
  toggleCondition,
} from "@/lib/shim-sham/conditions";
import { AonLink } from "../AonLink";

export function ConditionPicker({
  activeConditions,
  onChange,
  lockedConditionIds = [],
}: {
  activeConditions: ActiveCondition[];
  onChange: (conditions: ActiveCondition[]) => void;
  lockedConditionIds?: string[];
}) {
  return (
    <div className="condition-picker">
      {CONDITIONS.map((c) => {
        const active = getActiveCondition(activeConditions, c.id);
        const atMax = c.maxValue != null && (active?.value ?? 1) >= c.maxValue;
        const locked = lockedConditionIds.includes(c.id);

        if (c.valued) {
          return (
            <div
              key={c.id}
              className={`condition-picker__item ${active ? "condition-picker__item--active" : ""}`}
            >
              <AonLink href={c.url} className="condition-picker__name">
                {c.name}
              </AonLink>
              {active ? (
                <div className="condition-picker__value">
                  <button
                    type="button"
                    className="btn btn-icon condition-picker__step"
                    onClick={() => onChange(adjustConditionValue(activeConditions, c.id, -1))}
                    aria-label={`Decrease ${c.name}`}
                  >
                    −
                  </button>
                  <span className="condition-picker__value-label">{active.value ?? 1}</span>
                  <button
                    type="button"
                    className="btn btn-icon condition-picker__step"
                    onClick={() => onChange(adjustConditionValue(activeConditions, c.id, 1))}
                    disabled={atMax}
                    aria-label={`Increase ${c.name}`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn btn-icon condition-picker__remove"
                    onClick={() => onChange(removeCondition(activeConditions, c.id))}
                    disabled={locked}
                    aria-label={`Remove ${c.name}`}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn condition-picker__add"
                  onClick={() => onChange(toggleCondition(activeConditions, c.id))}
                >
                  Add
                </button>
              )}
            </div>
          );
        }

        const isActive = !!active;

        return (
          <button
            key={c.id}
            type="button"
            className={`btn condition-picker__toggle ${isActive ? "condition-picker__toggle--active" : ""}`}
            aria-pressed={isActive}
            onClick={() => {
              if (locked && isActive) return;
              onChange(toggleCondition(activeConditions, c.id));
            }}
            disabled={locked && isActive}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
