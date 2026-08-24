import type { CharacterAction, CharacterSheet } from "@/lib/types";
import type { ConditionActionLocks } from "@/lib/shim-sham/condition-effects";
import { ActionRow } from "../actions/ActionRow";
import { AonLink } from "../AonLink";
import { BottomPanel } from "../BottomPanel";

export function ActionsPanel({
  data,
  runtime,
  actionsByCost,
  locks,
  onClose,
}: {
  data: CharacterSheet["static"];
  runtime: CharacterSheet["runtime"];
  actionsByCost: {
    free: CharacterAction[];
    reaction: CharacterAction[];
    single: CharacterAction[];
  };
  locks: ConditionActionLocks;
  onClose: () => void;
}) {
  const actionProps = {
    combat: runtime.combat,
    jetpack: runtime.jetpack,
    panache: runtime.panache,
    meyelRerollUsed: runtime.meyelRerollUsed,
    locks,
  };

  return (
    <BottomPanel title="Actions" onClose={onClose} fullScreen>
      <div className="actions-layout">
        <div className="actions-other-column">
          <div className="action-group-title">Free Action</div>
          {actionsByCost.free.map((a) => (
            <ActionRow key={a.id} action={a} {...actionProps} />
          ))}
          <div className="action-group-title">Reaction</div>
          {actionsByCost.reaction.map((a) => (
            <ActionRow key={a.id} action={a} {...actionProps} />
          ))}
        </div>
        <div className="actions-single-section">
          <div className="action-group-title">Single Action</div>
          <div className="actions-single-grid">
            {actionsByCost.single.map((a) => (
              <ActionRow key={a.id} action={a} {...actionProps} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
        <AonLink href={data.playbookUrl}>Combat Playbook</AonLink>
        {" · "}
        <AonLink href={data.planUrl}>Level Plan</AonLink>
      </div>
    </BottomPanel>
  );
}
