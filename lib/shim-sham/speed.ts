import { ACCELERATE_SPEED_BONUS } from "@/lib/shim-sham/constants";
import { PAHTRA_LAND_SPEED } from "@/lib/shim-sham/ancestry";
import {
  COMMERCIAL_JETPACK_FLY_SPEED,
  hasJetpackInstalled,
} from "@/lib/shim-sham/jetpack";
import { stylishSpeedBonus } from "@/lib/shim-sham/stylish-speed";
import type { LevelSnapshot } from "@/lib/types";
import { modifiedSpeed } from "@/lib/shim-sham/condition-effects";

export type SpeedEntry = {
  label: string;
  value: number;
  /** Stylish Combatant / Vivacious Speed status bonus applies. */
  stylishBoost: boolean;
  accelerateBoost: boolean;
};

/** Climbing Claws (Pahtra 5): climb Speed equals land Speed. */
const CLIMBING_CLAWS_LEVEL = 5;

export function climbingClawsSpeedEntry(level: LevelSnapshot): SpeedEntry | null {
  if (level.level < CLIMBING_CLAWS_LEVEL) return null;
  return {
    label: "Climb",
    value: PAHTRA_LAND_SPEED,
    stylishBoost: true,
    accelerateBoost: true,
  };
}

export function jetpackFlySpeedEntry(
  level: number,
  options: { requireActive?: boolean; active?: boolean } = {},
): SpeedEntry | null {
  if (!hasJetpackInstalled(level)) return null;
  if (options.requireActive && !options.active) return null;
  return {
    label: "Fly",
    value: COMMERCIAL_JETPACK_FLY_SPEED,
    stylishBoost: true,
    accelerateBoost: false,
  };
}

export function buildSpeedEntries(level: LevelSnapshot, jetpackActive = false): SpeedEntry[] {
  return [
    { label: "Land", value: PAHTRA_LAND_SPEED, stylishBoost: true, accelerateBoost: true },
    jetpackFlySpeedEntry(level.level, { requireActive: true, active: jetpackActive }),
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
