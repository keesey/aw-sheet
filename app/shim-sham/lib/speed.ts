import { ACCELERATE_SPEED_BONUS, PANACHE_SPEED_BONUS } from "./constants";
import type { SpeedEntry } from "../types";
import type { LevelSnapshot } from "@/lib/types";
import { modifiedSpeed } from "@/lib/shim-sham/condition-effects";

export function buildSpeedEntries(level: LevelSnapshot, jetpack: boolean): SpeedEntry[] {
  return [
    { label: "Land", value: level.landSpeed, panacheBoost: true, accelerateBoost: true },
    level.flySpeed != null && jetpack
      ? { label: "Fly", value: level.flySpeed, panacheBoost: true, accelerateBoost: false }
      : null,
    level.climbSpeed != null
      ? { label: "Climb", value: level.climbSpeed, panacheBoost: true, accelerateBoost: true }
      : null,
    level.swimSpeed != null
      ? { label: "Swim", value: level.swimSpeed, panacheBoost: false, accelerateBoost: false }
      : null,
  ].filter((entry): entry is SpeedEntry => entry != null);
}

export function getSpeedDisplayValue(
  speed: SpeedEntry,
  panache: boolean,
  accelerate: boolean,
  speedDelta = 0,
) {
  let total = speed.value;
  if (panache && speed.panacheBoost) total += PANACHE_SPEED_BONUS;
  if (accelerate && speed.accelerateBoost) total += ACCELERATE_SPEED_BONUS;
  return modifiedSpeed(total, speedDelta);
}

export function getSpeedClassName(speed: SpeedEntry, panache: boolean, accelerate: boolean) {
  const panacheActive = panache && speed.panacheBoost;
  const accelerateActive = accelerate && speed.accelerateBoost;
  if (panacheActive && accelerateActive) return "speed-accelerate-panache";
  if (accelerateActive) return "speed-accelerate";
  if (panacheActive) return "speed-panache";
  return undefined;
}
