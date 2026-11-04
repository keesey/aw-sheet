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

export function ActionGroupSection({
  title,
  actionsByCost,
  actionProps,
  variant = "standalone",
}: {
  title: string;
  actionsByCost: ActionsByCost;
  actionProps: Omit<ComponentProps<typeof ActionRow>, "action">;
  variant?: "embedded" | "standalone";
}) {
  const sections = [
    actionsByCost.free,
    actionsByCost.reaction,
    actionsByCost.single,
    actionsByCost.double,
    actionsByCost.triple,
  ];
  const rows = renderActionRows(sections, actionProps);

  if (variant === "embedded") {
    return (
      <>
        <div className="action-group-title">{title}</div>
        {rows}
      </>
    );
  }

  return (
    <div className="stat-card sheet-section actions-main-section">
      <div className="stat-label" style={{ marginBottom: "0.5rem" }}>
        {title}
      </div>
      {rows}
    </div>
  );
}
