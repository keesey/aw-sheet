import type { CharacterAction, CharacterSheet } from "@/lib/types";
import { ActionRow, MinuteActionRow } from "../actions/ActionRow";
import { AonLink } from "../AonLink";
import { BottomPanel } from "../BottomPanel";

export function ActionsPanel({
  data,
  runtime,
  actionsByCost,
  onClose,
}: {
  data: CharacterSheet["static"];
  runtime: CharacterSheet["runtime"];
  actionsByCost: {
    free: CharacterAction[];
    reaction: CharacterAction[];
    single: CharacterAction[];
    minute: CharacterAction[];
  };
  onClose: () => void;
}) {
  const actionProps = {
    combat: runtime.combat,
    jetpack: runtime.jetpack,
    panache: runtime.panache,
    meyelRerollUsed: runtime.meyelRerollUsed,
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
          <div className="action-group-title">One Minute</div>
          {actionsByCost.minute.map((a) => (
            <MinuteActionRow key={a.id} action={a} />
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
