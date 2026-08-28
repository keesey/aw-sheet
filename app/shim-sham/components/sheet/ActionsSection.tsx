import type { ComponentProps } from "react";
import type { CharacterAction, LevelSnapshot, RuntimeState } from "@/lib/types";
import type { ConditionActionLocks } from "@/lib/shim-sham/condition-effects";
import { compareByName } from "@/lib/shim-sham/sort";
import type { StrikesOpenOptions } from "../../lib/strike-format";
import type { SaveFn } from "../../types";
import { ActionRow } from "../actions/ActionRow";
import { PilotingActionsSection } from "./PilotingActionsSection";

type ActionsByCost = {
  free: CharacterAction[];
  reaction: CharacterAction[];
  single: CharacterAction[];
  double: CharacterAction[];
  triple: CharacterAction[];
};

function renderActionRows(
  sections: CharacterAction[][],
  actionProps: Omit<ComponentProps<typeof ActionRow>, "action">,
) {
  return sections.flatMap((section) =>
    section.map((action) => (
      <ActionRow key={action.id} action={action} {...actionProps} />
    )),
  );
}

function buildActionSections(
  actionsByCost: ActionsByCost,
  strikeAction: CharacterAction,
): CharacterAction[][] {
  return [
    actionsByCost.free,
    actionsByCost.reaction,
    [...actionsByCost.single, strikeAction].sort(compareByName),
    actionsByCost.double,
    actionsByCost.triple,
  ];
}

export function ActionsSection({
  actionsByCost,
  vehicleActionsByCost,
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
  vehicles,
  panache,
  meyelRerollUsed,
  locks,
  athleticsBonus,
}: {
  actionsByCost: ActionsByCost;
  vehicleActionsByCost: ActionsByCost;
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
  vehicles: boolean;
  panache: boolean;
  meyelRerollUsed: boolean;
  locks: ConditionActionLocks;
  athleticsBonus: number;
}) {
  const actionProps = {
    encounter,
    jetpack,
    vehicles,
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

  return (
    <div className="stat-card sheet-section actions-main-section">
      <div className="stat-label" style={{ marginBottom: "0.5rem" }}>
        Actions
      </div>

      {renderActionRows(buildActionSections(actionsByCost, strikeAction), actionProps)}

      {vehicles ? (
        <PilotingActionsSection
          vehicleActionsByCost={vehicleActionsByCost}
          actionProps={actionProps}
          variant="embedded"
        />
      ) : null}
    </div>
  );
}
