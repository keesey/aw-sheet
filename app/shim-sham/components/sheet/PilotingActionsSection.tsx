import type { ComponentProps } from "react";
import type { CharacterAction } from "@/lib/types";
import { ActionRow } from "../actions/ActionRow";

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

export function PilotingActionsSection({
  pilotingActionsByCost,
  actionProps,
  variant = "standalone",
}: {
  pilotingActionsByCost: ActionsByCost;
  actionProps: Omit<ComponentProps<typeof ActionRow>, "action">;
  variant?: "embedded" | "standalone";
}) {
  const pilotingSections = [
    pilotingActionsByCost.free,
    pilotingActionsByCost.reaction,
    pilotingActionsByCost.single,
    pilotingActionsByCost.double,
    pilotingActionsByCost.triple,
  ];
  const rows = renderActionRows(pilotingSections, actionProps);

  if (variant === "embedded") {
    return (
      <>
        <div className="action-group-title">Piloting</div>
        {rows}
      </>
    );
  }

  return (
    <div className="stat-card sheet-section actions-main-section">
      <div className="stat-label" style={{ marginBottom: "0.5rem" }}>
        Piloting
      </div>
      {rows}
    </div>
  );
}
