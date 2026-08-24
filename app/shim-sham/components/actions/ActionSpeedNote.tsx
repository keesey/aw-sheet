import type { LevelSnapshot, RuntimeState } from "@/lib/types";
import { getSpeedClassName, getSpeedDisplayValue } from "../../lib/speed";
import type { SpeedEntry } from "../../types";

function SpeedValue({
  speed,
  panache,
  accelerate,
  speedDelta,
  valueOnly = false,
}: {
  speed: SpeedEntry;
  panache: boolean;
  accelerate: boolean;
  speedDelta: number;
  valueOnly?: boolean;
}) {
  const speedClass = getSpeedClassName(speed, panache, accelerate);
  const displayValue = getSpeedDisplayValue(speed, panache, accelerate, speedDelta);
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
  panache,
  accelerate,
  speedDelta,
  valueOnly = false,
}: {
  speeds: SpeedEntry[];
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
    const speeds: SpeedEntry[] = [
      { label: "Land", value: level.landSpeed, panacheBoost: true, accelerateBoost: true },
      ...(level.climbSpeed != null
        ? [{ label: "Climb", value: level.climbSpeed, panacheBoost: true, accelerateBoost: true }]
        : []),
    ];
    return (
      <ActionSpeedList
        speeds={speeds}
        panache={runtime.panache}
        accelerate={runtime.accelerate}
        speedDelta={speedDelta}
      />
    );
  }

  if (actionId === "fly" && runtime.jetpack && level.flySpeed != null) {
    return (
      <ActionSpeedList
        speeds={[{ label: "Fly", value: level.flySpeed, panacheBoost: true, accelerateBoost: false }]}
        panache={runtime.panache}
        accelerate={runtime.accelerate}
        speedDelta={speedDelta}
        valueOnly
      />
    );
  }

  return null;
}
