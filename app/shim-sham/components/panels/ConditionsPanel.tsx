import type { ActiveCondition } from "@/lib/types";
import type { SaveFn } from "../../types";
import { BottomPanel } from "../BottomPanel";
import { ConditionPicker } from "../conditions/ConditionPicker";

export function ConditionsPanel({
  conditions,
  lockedConditionIds,
  save,
  onClose,
}: {
  conditions: ActiveCondition[];
  lockedConditionIds: string[];
  save: SaveFn;
  onClose: () => void;
}) {
  return (
    <BottomPanel title="Conditions" onClose={onClose}>
      <ConditionPicker
        activeConditions={conditions}
        onChange={(next) => void save({ conditions: next })}
        lockedConditionIds={lockedConditionIds}
      />
    </BottomPanel>
  );
}
