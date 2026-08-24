import type { SkillEntry } from "@/lib/types";
import { formatSignedBonus } from "@/lib/shim-sham/skills";
import {
  SHIM_SHAM_EXPLORATION,
  explorationActivityBonus,
  orderedExplorationActivities,
} from "@/lib/shim-sham/exploration-activities";
import { statModClass } from "../../lib/format";
import { AonLink } from "../AonLink";

export function ExploreSection({
  skills,
  skillDelta,
  perception,
  perceptionDelta,
}: {
  skills: SkillEntry[];
  skillDelta: Record<string, number>;
  perception: number;
  perceptionDelta: number;
}) {
  const activities = orderedExplorationActivities(SHIM_SHAM_EXPLORATION);

  return (
    <div className="stat-card sheet-section">
      <div className="stat-label" style={{ marginBottom: "0.5rem" }}>
        Explore
      </div>
      <div className="explore-grid">
        {activities.map((activity) => {
          const bonus = explorationActivityBonus(activity, skills, perception);
          const bonusDelta =
            activity.bonusSource === "Perception"
              ? perceptionDelta
              : activity.bonusSource
                ? skillDelta[activity.bonusSource] ?? 0
                : 0;

          return (
            <div
              key={activity.id}
              className={`explore-entry${activity.parentId ? " explore-entry--indented" : ""}`}
            >
              <AonLink href={activity.url}>{activity.name}</AonLink>
              {bonus != null ? (
                <strong className={statModClass(bonusDelta)}>{formatSignedBonus(bonus)}</strong>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
