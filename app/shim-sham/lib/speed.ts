import { ACCELERATE_SPEED_BONUS, PANACHE_SPEED_BONUS } from "./constants";
import type { SpeedEntry } from "../types";
import { modifiedSpeed } from "@/lib/shim-sham/condition-effects";

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
