import type { ActiveCondition } from "@/lib/types";
import {
  findCondition,
  formatActiveCondition,
} from "@/lib/shim-sham/conditions";
import { AonLink } from "../AonLink";

export function ConditionChip({
  active,
  onAdjust,
  onRemove,
  removeDisabled = false,
  showAdjustments = true,
}: {
  active: ActiveCondition;
  onAdjust?: (delta: number) => void;
  onRemove: () => void;
  removeDisabled?: boolean;
  showAdjustments?: boolean;
}) {
  const entry = findCondition(active.id);
  const atMax = entry?.maxValue != null && (active.value ?? 1) >= entry.maxValue;

  return (
    <span className="chip condition-chip">
      {entry ? (
        <AonLink href={entry.url}>{formatActiveCondition(active)}</AonLink>
      ) : (
        formatActiveCondition(active)
      )}
      {showAdjustments && entry?.valued && (
        <>
          <button
            type="button"
            className="condition-chip__step"
            onClick={() => onAdjust?.(-1)}
            aria-label={`Decrease ${entry.name}`}
          >
            −
          </button>
          <span className="condition-chip__value">{active.value ?? 1}</span>
          <button
            type="button"
            className="condition-chip__step"
            onClick={() => onAdjust?.(1)}
            disabled={atMax}
            aria-label={`Increase ${entry.name}`}
          >
            +
          </button>
        </>
      )}
      <button
        type="button"
        onClick={onRemove}
        disabled={removeDisabled}
        aria-label={`Remove ${entry?.name ?? active.id}`}
      >
        ×
      </button>
    </span>
  );
}
