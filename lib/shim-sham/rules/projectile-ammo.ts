import { SHIM_SHAM_AMMUNITION, SHIM_SHAM_CONSUMABLES } from "@/lib/shim-sham/data/inventory";
import { isBreachingGunInCloudStorage } from "@/lib/shim-sham/data/cloud-storage";
import type { RuntimeState } from "@/lib/types";

export type ProjectileMagazineKey = "breachingGunMagazine" | "crossbolterMagazine";

export const PROJECTILE_MAGAZINE_WEAPONS: {
  key: ProjectileMagazineKey;
  label: string;
}[] = [
  { key: "breachingGunMagazine", label: "Breaching Gun (Advanced)" },
  { key: "crossbolterMagazine", label: "Crossbolter (Advanced)" },
];

/** Which runtime magazine field a strike draws from when fired. */
export function projectileMagazineKey(strikeId: string): ProjectileMagazineKey | null {
  switch (strikeId) {
    case "breaching-gun":
      return "breachingGunMagazine";
    case "crossbolter":
      return "crossbolterMagazine";
    default:
      return null;
  }
}

export function projectileMagazineMax(key: ProjectileMagazineKey): number {
  switch (key) {
    case "breachingGunMagazine":
      return SHIM_SHAM_AMMUNITION.breachingGun.magazineMax;
    case "crossbolterMagazine":
      return SHIM_SHAM_AMMUNITION.crossbolter.magazineMax;
  }
}

/** Fill the weapon magazine from spare rounds (Reload action). Returns null if already full or no spare. */
export function reloadProjectileMagazine(
  runtime: RuntimeState,
  key: ProjectileMagazineKey,
): Partial<RuntimeState> | null {
  const max = projectileMagazineMax(key);
  const current = runtime[key];
  const need = max - current;
  if (need <= 0) return null;
  const load = Math.min(need, runtime.projectileRounds);
  if (load <= 0) return null;
  return {
    [key]: current + load,
    projectileRounds: runtime.projectileRounds - load,
  };
}

export function canReloadAnyProjectileMagazine(runtime: RuntimeState): boolean {
  return PROJECTILE_MAGAZINE_WEAPONS.some((weapon) => {
    if (
      weapon.key === "breachingGunMagazine" &&
      isBreachingGunInCloudStorage(runtime, SHIM_SHAM_CONSUMABLES)
    ) {
      return false;
    }
    return reloadProjectileMagazine(runtime, weapon.key) !== null;
  });
}

/** Load from spare (+1) or unload to spare (−1). Returns null if no change. */
export function adjustProjectileMagazine(
  runtime: RuntimeState,
  key: ProjectileMagazineKey,
  delta: number,
): Partial<RuntimeState> | null {
  const max = projectileMagazineMax(key);
  const current = runtime[key];
  if (delta > 0) {
    const load = Math.min(delta, max - current, runtime.projectileRounds);
    if (load <= 0) return null;
    return {
      [key]: current + load,
      projectileRounds: runtime.projectileRounds - load,
    };
  }
  const unload = Math.min(-delta, current);
  if (unload <= 0) return null;
  return {
    [key]: current - unload,
    projectileRounds: runtime.projectileRounds + unload,
  };
}
