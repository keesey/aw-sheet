import type { SkillEntry } from "@/lib/types";
import { formatSignedBonus } from "@/lib/shim-sham/skills";
import {
  EXPLORATION_ACTIVITIES,
  explorationActivityBonus,
  orderedExplorationActivities,
  type ExplorationActivity,
} from "@/lib/shim-sham/exploration-activities";
import { statModClass } from "../../ui/format";
import { RollBonusButton } from "../RollBonusButton";
import { AonLink } from "../AonLink";

function ExploreActivityRow({
  activity,
  bonus,
  bonusDelta,
}: {
  activity: ExplorationActivity;
  bonus?: number;
  bonusDelta: number;
}) {
  const className = "action-row action-row--compact action-row--split";

  return (
    <div className={className}>
      <div className="action-row__main">
        <AonLink href={activity.url} className="action-row__link">
          {activity.name}
        </AonLink>
      </div>
      {bonus != null ? (
        <div className="action-row__aside">
          <RollBonusButton
            label={activity.name}
            bonus={bonus}
            className={`action-name__bonus ${statModClass(bonusDelta) ?? ""}`.trim()}
          >
            {formatSignedBonus(bonus)}
          </RollBonusButton>
        </div>
      ) : null}
    </div>
  );
}

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
  const activities = orderedExplorationActivities(EXPLORATION_ACTIVITIES);

  return (
    <div className="stat-card sheet-section actions-main-section">
      <div className="stat-label" style={{ marginBottom: "0.5rem" }}>
        Activities
      </div>
      {activities.map((activity) => {
        const bonus = explorationActivityBonus(activity, skills, perception);
        const bonusDelta =
          activity.bonusSource === "Perception"
            ? perceptionDelta
            : activity.bonusSource
              ? skillDelta[activity.bonusSource] ?? 0
              : 0;

        return (
          <ExploreActivityRow
            key={activity.id}
            activity={activity}
            bonus={bonus}
            bonusDelta={bonusDelta}
          />
        );
      })}
    </div>
  );
}
