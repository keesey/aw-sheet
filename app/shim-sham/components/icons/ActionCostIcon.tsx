import type { CharacterAction } from "@/lib/types";
import {
  ACTION_COST_ICONS,
  actionCostIconKind,
  type ActionCostIconKind,
} from "@/lib/shim-sham/data/action-cost-icons";

const OUTLINE_STROKE_WIDTH = 11;

export function ActionCostIcon({
  cost,
  kind: kindProp,
  className,
}: {
  cost?: CharacterAction["cost"];
  kind?: ActionCostIconKind;
  className?: string;
}) {
  const kind = kindProp ?? (cost ? actionCostIconKind(cost) : null);
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
