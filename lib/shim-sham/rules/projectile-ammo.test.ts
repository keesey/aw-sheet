import { describe, expect, it } from "vitest";
import type { RuntimeState } from "@/lib/types";
import { createDefaultRuntime } from "@/lib/shim-sham/sheet/static";
import {
  projectileMagazineKey,
  projectileMagazineMax,
  reloadProjectileMagazine,
} from "@/lib/shim-sham/rules/projectile-ammo";

function runtime(partial: Partial<RuntimeState>): RuntimeState {
  return { ...createDefaultRuntime(8), ...partial };
}

describe("projectileMagazineKey", () => {
  it("maps projectile strikes to magazine fields", () => {
    expect(projectileMagazineKey("crossbolter")).toBe("crossbolterMagazine");
    expect(projectileMagazineKey("breaching-gun")).toBe("breachingGunMagazine");
    expect(projectileMagazineKey("rapier")).toBeNull();
  });

  it("exposes magazine capacities", () => {
    expect(projectileMagazineMax("breachingGunMagazine")).toBe(3);
    expect(projectileMagazineMax("crossbolterMagazine")).toBe(1);
  });
});

describe("reloadProjectileMagazine", () => {
  it("fills magazine from spare up to capacity", () => {
    const state = runtime({
      projectileRounds: 10,
      breachingGunMagazine: 1,
      crossbolterMagazine: 0,
    });
    expect(reloadProjectileMagazine(state, "breachingGunMagazine")).toEqual({
      breachingGunMagazine: 3,
      projectileRounds: 8,
    });
    expect(reloadProjectileMagazine(state, "crossbolterMagazine")).toEqual({
      crossbolterMagazine: 1,
      projectileRounds: 9,
    });
  });

  it("returns null when full or no spare", () => {
    const full = runtime({ projectileRounds: 5, breachingGunMagazine: 3 });
    expect(reloadProjectileMagazine(full, "breachingGunMagazine")).toBeNull();
    const empty = runtime({ projectileRounds: 0, crossbolterMagazine: 0 });
    expect(reloadProjectileMagazine(empty, "crossbolterMagazine")).toBeNull();
  });
});
