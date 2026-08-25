import { ACCELERATE_SPEED_BONUS } from "./constants";
import { stylishSpeedBonus } from "@/lib/shim-sham/stylish-speed";
import type { SpeedEntry } from "../types";
import type { LevelSnapshot } from "@/lib/types";
import { modifiedSpeed } from "@/lib/shim-sham/condition-effects";

/** Climbing Claws (Pahtra 5): climb Speed equals land Speed. */
const CLIMBING_CLAWS_LEVEL = 5;

export function climbingClawsSpeedEntry(level: LevelSnapshot): SpeedEntry | null {
  if (level.level < CLIMBING_CLAWS_LEVEL) return null;
  return {
    label: "Climb",
    value: level.landSpeed,
    stylishBoost: true,
    accelerateBoost: true,
  };
}

export function buildSpeedEntries(level: LevelSnapshot, jetpack: boolean): SpeedEntry[] {
  return [
    { label: "Land", value: level.landSpeed, stylishBoost: true, accelerateBoost: true },
    level.flySpeed != null && jetpack
      ? { label: "Fly", value: level.flySpeed, stylishBoost: true, accelerateBoost: false }
      : null,
    climbingClawsSpeedEntry(level),
    level.swimSpeed != null
      ? { label: "Swim", value: level.swimSpeed, stylishBoost: true, accelerateBoost: false }
      : null,
  ].filter((entry): entry is SpeedEntry => entry != null);
}

export function getSpeedDisplayValue(
  speed: SpeedEntry,
  level: number,
  panache: boolean,
  accelerate: boolean,
  speedDelta = 0,
) {
  let total = speed.value;
  if (speed.stylishBoost) total += stylishSpeedBonus(level, panache);
  if (accelerate && speed.accelerateBoost) total += ACCELERATE_SPEED_BONUS;
  return modifiedSpeed(total, speedDelta);
}

export function getSpeedClassName(speed: SpeedEntry, panache: boolean, accelerate: boolean) {
  const panacheActive = panache && speed.stylishBoost;
  const accelerateActive = accelerate && speed.accelerateBoost;
  if (panacheActive && accelerateActive) return "speed-accelerate-panache";
  if (accelerateActive) return "speed-accelerate";
  if (panacheActive) return "speed-panache";
  return undefined;
}
