import type { ActiveCondition } from "@/lib/types";
import { visibleConditionTags } from "@/lib/shim-sham/condition-effects";
import { removeCondition } from "@/lib/shim-sham/conditions";
import type { SaveFn } from "../../types";
import { ConditionChip } from "../conditions/ConditionChip";

export function ConditionTags({
  conditions,
  lockedConditionIds,
  save,
}: {
  conditions: ActiveCondition[];
  lockedConditionIds: string[];
  save: SaveFn;
}) {
  const visible = visibleConditionTags(conditions);
  if (visible.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {visible.map((active) => (
        <ConditionChip
          key={active.id}
          active={active}
          showAdjustments={false}
          onRemove={() => void save({ conditions: removeCondition(conditions, active.id) })}
          removeDisabled={lockedConditionIds.includes(active.id)}
        />
      ))}
    </div>
  );
}
