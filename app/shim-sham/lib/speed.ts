import { ACCELERATE_SPEED_BONUS, PANACHE_SPEED_BONUS } from "./constants";
import type { SpeedEntry } from "../types";

export function getSpeedDisplayValue(speed: SpeedEntry, panache: boolean, accelerate: boolean) {
  let total = speed.value;
  if (panache && speed.panacheBoost) total += PANACHE_SPEED_BONUS;
  if (accelerate && speed.accelerateBoost) total += ACCELERATE_SPEED_BONUS;
  return total;
}

export function getSpeedClassName(speed: SpeedEntry, panache: boolean, accelerate: boolean) {
  const panacheActive = panache && speed.panacheBoost;
  const accelerateActive = accelerate && speed.accelerateBoost;
  if (panacheActive && accelerateActive) return "speed-accelerate-panache";
  if (accelerateActive) return "speed-accelerate";
  if (panacheActive) return "speed-panache";
  return undefined;
}
