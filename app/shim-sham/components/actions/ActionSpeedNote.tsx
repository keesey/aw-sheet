import type { LevelSnapshot, RuntimeState } from "@/lib/types";
import {
  climbingClawsSpeedEntry,
  getSpeedClassName,
  getSpeedDisplayValue,
  jetpackFlySpeedEntry,
} from "../../lib/speed";
import type { SpeedEntry } from "../../types";

function SpeedValue({
  speed,
  level,
  panache,
  accelerate,
  speedDelta,
  valueOnly = false,
}: {
  speed: SpeedEntry;
  level: number;
  panache: boolean;
  accelerate: boolean;
  speedDelta: number;
  valueOnly?: boolean;
}) {
  const speedClass = getSpeedClassName(speed, panache, accelerate);
  const displayValue = getSpeedDisplayValue(speed, level, panache, accelerate, speedDelta);
  const penalized = speedDelta < 0;

  if (valueOnly) {
    return <span className={penalized ? "stat-penalized" : speedClass}>{displayValue}′</span>;
  }

  return (
    <>
      {speed.label}{" "}
      <span className={penalized ? "stat-penalized" : speedClass}>{displayValue}′</span>
    </>
  );
}

function ActionSpeedList({
  speeds,
  level,
  panache,
  accelerate,
  speedDelta,
  valueOnly = false,
}: {
  speeds: SpeedEntry[];
  level: number;
  panache: boolean;
  accelerate: boolean;
  speedDelta: number;
  valueOnly?: boolean;
}) {
  return (
    <span className="action-row__speeds">
      {speeds.map((speed, index) => (
        <span key={speed.label}>
          {index > 0 && " · "}
          <SpeedValue
            speed={speed}
            level={level}
            panache={panache}
            accelerate={accelerate}
            speedDelta={speedDelta}
            valueOnly={valueOnly}
          />
        </span>
      ))}
    </span>
  );
}

export function ActionSpeedNote({
  actionId,
  level,
  runtime,
  speedDelta,
}: {
  actionId: string;
  level: LevelSnapshot;
  runtime: RuntimeState;
  speedDelta: number;
}) {
  if (actionId === "stride") {
    const climb = climbingClawsSpeedEntry(level);
    const speeds: SpeedEntry[] = [
      { label: "Land", value: level.landSpeed, stylishBoost: true, accelerateBoost: true },
      ...(climb ? [climb] : []),
    ];
    return (
      <ActionSpeedList
        speeds={speeds}
        level={level.level}
        panache={runtime.panache}
        accelerate={runtime.accelerate}
        speedDelta={speedDelta}
      />
    );
  }

  if (actionId === "fly") {
    const fly = jetpackFlySpeedEntry(level.level, {
      requireActive: true,
      active: runtime.jetpack,
    });
    if (!fly) return null;
    return (
      <ActionSpeedList
        speeds={[fly]}
        level={level.level}
        panache={runtime.panache}
        accelerate={runtime.accelerate}
        speedDelta={speedDelta}
        valueOnly
      />
    );
  }

  return null;
}
