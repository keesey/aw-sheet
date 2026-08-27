import type { CharacterAction, LevelSnapshot, RuntimeState } from "@/lib/types";
import type { ConditionActionLocks } from "@/lib/shim-sham/condition-effects";
import { compareByName } from "@/lib/shim-sham/sort";
import type { StrikesOpenOptions } from "../../lib/strike-format";
import type { SaveFn } from "../../types";
import { ActionRow } from "../actions/ActionRow";

export function ActionsSection({
  actionsByCost,
  strikeAction,
  level,
  speedDelta,
  runtime,
  ffUsesLeft,
  save,
  onOpenStrikes,
  onOpenAreaWeapons,
  encounter,
  jetpack,
  panache,
  meyelRerollUsed,
  locks,
  athleticsBonus,
}: {
  actionsByCost: {
    free: CharacterAction[];
    reaction: CharacterAction[];
    single: CharacterAction[];
    double: CharacterAction[];
    triple: CharacterAction[];
  };
  strikeAction: CharacterAction;
  level: LevelSnapshot;
  speedDelta: number;
  runtime: RuntimeState;
  ffUsesLeft: number;
  save: SaveFn;
  onOpenStrikes: (options: StrikesOpenOptions) => void;
  onOpenAreaWeapons: () => void;
  encounter: boolean;
  jetpack: boolean;
  panache: boolean;
  meyelRerollUsed: boolean;
  locks: ConditionActionLocks;
  athleticsBonus: number;
}) {
  const actionProps = {
    encounter,
    jetpack,
    panache,
    meyelRerollUsed,
    locks,
    compact: true,
    runtime,
    ffUsesLeft,
    save,
    onOpenStrikes,
    onOpenAreaWeapons,
    athleticsBonus,
    level,
    speedDelta,
  };

  const singleActions = [...actionsByCost.single, strikeAction].sort(compareByName);

  const actionSections = [
    actionsByCost.free,
    actionsByCost.reaction,
    singleActions,
    actionsByCost.double,
    actionsByCost.triple,
  ];

  return (
    <div className="stat-card sheet-section actions-main-section">
      <div className="stat-label" style={{ marginBottom: "0.5rem" }}>
        Actions
      </div>

      {actionSections.flatMap((section) =>
        section.map((action) => (
          <ActionRow key={action.id} action={action} {...actionProps} />
        )),
      )}
    </div>
  );
}
