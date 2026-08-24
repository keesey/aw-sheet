import type { CharacterAction, RuntimeState } from "@/lib/types";
import type { ConditionActionLocks } from "@/lib/shim-sham/condition-effects";
import type { SaveFn } from "../../types";
import { ActionRow } from "../actions/ActionRow";

export function ActionsSection({
  actionsByCost,
  strikeAction,
  runtime,
  ffUsesLeft,
  save,
  onOpenStrikes,
  onOpenAreaWeapons,
  combat,
  jetpack,
  panache,
  meyelRerollUsed,
  locks,
}: {
  actionsByCost: {
    free: CharacterAction[];
    reaction: CharacterAction[];
    single: CharacterAction[];
    double: CharacterAction[];
  };
  strikeAction: CharacterAction;
  runtime: RuntimeState;
  ffUsesLeft: number;
  save: SaveFn;
  onOpenStrikes: () => void;
  onOpenAreaWeapons: () => void;
  combat: boolean;
  jetpack: boolean;
  panache: boolean;
  meyelRerollUsed: boolean;
  locks: ConditionActionLocks;
}) {
  const actionProps = {
    combat,
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
  };

  const singleActions = [...actionsByCost.single, strikeAction].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

  return (
    <div className="stat-card sheet-section actions-main-section">
      <div className="stat-label" style={{ marginBottom: "0.5rem" }}>
        Actions
      </div>

      <div className="action-group-title">Free Action</div>
      {actionsByCost.free.map((action) => (
        <ActionRow key={action.id} action={action} {...actionProps} />
      ))}

      <div className="action-group-title">Reaction</div>
      {actionsByCost.reaction.map((action) => (
        <ActionRow key={action.id} action={action} {...actionProps} />
      ))}

      <div className="action-group-title">Single Action</div>
      {singleActions.map((action) => (
        <ActionRow key={action.id} action={action} {...actionProps} />
      ))}

      <div className="action-group-title">Double Action</div>
      {actionsByCost.double.map((action) => (
        <ActionRow key={action.id} action={action} {...actionProps} />
      ))}
    </div>
  );
}
