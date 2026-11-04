import { describe, expect, it } from "vitest";
import { DEFAULT_CLOUD_STORAGE } from "@/lib/shim-sham/data/cloud-storage";
import {
  canDrawWeaponStrike,
  drawStrikesForInventoryItemPatch,
  filterDrawnWeaponStrikes,
  getWeaponCarryState,
  isStrikeDrawnForAttack,
} from "@/lib/shim-sham/data/weapon-carry";
import { SHIM_SHAM_CONSUMABLES } from "@/lib/shim-sham/data/inventory";
import { buildWeaponStrikes } from "@/lib/shim-sham/rules/strikes";
import { requireLevelSnapshot } from "@/lib/shim-sham/data/progression";
import { createDefaultRuntime } from "@/lib/shim-sham/sheet/static";

describe("weapon carry", () => {
  it("tailblade and jaws are always drawn when not in cloud", () => {
    const runtime = createDefaultRuntime(8);
    expect(isStrikeDrawnForAttack(runtime, SHIM_SHAM_CONSUMABLES, "tailblade")).toBe(true);
    expect(isStrikeDrawnForAttack(runtime, SHIM_SHAM_CONSUMABLES, "jaws")).toBe(true);
  });

  it("holstered rapier is not available to strike until drawn", () => {
    const runtime = createDefaultRuntime(8);
    expect(getWeaponCarryState(runtime, SHIM_SHAM_CONSUMABLES, "rapier")).toBe("stowed");
    const weapons = buildWeaponStrikes(requireLevelSnapshot(8));
    const drawn = filterDrawnWeaponStrikes(weapons, runtime, SHIM_SHAM_CONSUMABLES);
    expect(drawn.some((w) => w.id === "rapier")).toBe(false);
    expect(drawn.some((w) => w.id === "tailblade")).toBe(true);
  });

  it("retrieving breaching gun from cloud draws it", () => {
    const runtime = {
      ...createDefaultRuntime(8),
      cloudStorage: DEFAULT_CLOUD_STORAGE,
    };
    expect(canDrawWeaponStrike(runtime, SHIM_SHAM_CONSUMABLES, "breaching-gun")).toBe(false);
    const patch = drawStrikesForInventoryItemPatch(
      { ...runtime, cloudStorage: { ...DEFAULT_CLOUD_STORAGE, equipmentIds: ["bipod-breaching-gun"] } },
      SHIM_SHAM_CONSUMABLES,
      "breaching-gun-item",
    );
    expect(patch.weaponCarry?.["breaching-gun"]).toBe("drawn");
  });
});
