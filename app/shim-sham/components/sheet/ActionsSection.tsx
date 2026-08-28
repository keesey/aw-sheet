import type { ComponentProps } from "react";
import type { CharacterAction, LevelSnapshot, RuntimeState } from "@/lib/types";
import type { ConditionActionLocks } from "@/lib/shim-sham/condition-effects";
import { compareByName } from "@/lib/shim-sham/sort";
import type { StrikesOpenOptions } from "@/lib/shim-sham/strike-open-options";
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
  pilotingActionsByCost,
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
  actionsByCost: ActionsByCost;
  pilotingActionsByCost: ActionsByCost;
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

  return (
    <div className="stat-card sheet-section actions-main-section">
      <div className="stat-label" style={{ marginBottom: "0.5rem" }}>
        Actions
      </div>

      {renderActionRows(buildActionSections(actionsByCost, strikeAction), actionProps)}

      <PilotingActionsSection
        pilotingActionsByCost={pilotingActionsByCost}
        actionProps={actionProps}
        variant="embedded"
      />
    </div>
  );
}
