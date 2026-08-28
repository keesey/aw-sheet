import type { CharacterAction } from "@/lib/types";
import {
  ACTION_COST_ICONS,
  actionCostIconKind,
} from "@/lib/shim-sham/data/action-cost-icons";

const OUTLINE_STROKE_WIDTH = 11;

export function ActionCostIcon({
  cost,
  className,
}: {
  cost: CharacterAction["cost"];
  className?: string;
}) {
  const kind = actionCostIconKind(cost);
  if (!kind) return null;

  const icon = ACTION_COST_ICONS[kind];
  const height = 16;
  const width = Math.round(height * icon.aspect);

  return (
    <svg
      className={className}
      viewBox={icon.viewBox}
      width={width}
      height={height}
      role="img"
      aria-label={icon.label}
      fill={icon.outline ? "none" : "currentColor"}
      stroke={icon.outline ? "currentColor" : undefined}
      strokeWidth={icon.outline ? OUTLINE_STROKE_WIDTH : undefined}
      strokeLinejoin="round"
    >
      {icon.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
