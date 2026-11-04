import { describe, expect, it } from "vitest";
import {
  DEFAULT_CLOUD_STORAGE,
  filterWeaponStrikesByCloudStorage,
  isWeaponStrikeInCloudStorage,
  normalizeCloudStorage,
} from "@/lib/shim-sham/data/cloud-storage";
import { buildWeaponStrikes } from "@/lib/shim-sham/rules/strikes";
import { requireLevelSnapshot } from "@/lib/shim-sham/data/progression";
import {
  inventoryCloudStorageBulk,
  inventoryTotalBulk,
  SHIM_SHAM_CONSUMABLES,
  SHIM_SHAM_INVENTORY,
} from "@/lib/shim-sham/data/inventory";
import { createDefaultRuntime } from "@/lib/shim-sham/sheet/static";

describe("cloud storage bulk", () => {
  it("default stow list drops encumbrance bulk for level 8 loadout", () => {
    const runtime = createDefaultRuntime(8);
    const withoutCloud = inventoryTotalBulk(
      SHIM_SHAM_INVENTORY,
      SHIM_SHAM_CONSUMABLES,
      { ...runtime, cloudStorage: { equipmentIds: [], consumables: {} } },
    );
    const withDefaultCloud = inventoryTotalBulk(
      SHIM_SHAM_INVENTORY,
      SHIM_SHAM_CONSUMABLES,
      { ...runtime, cloudStorage: DEFAULT_CLOUD_STORAGE },
    );
    expect(withoutCloud).toBe(8);
    expect(withDefaultCloud).toBeLessThan(7);
    expect(withDefaultCloud).toBe(5);
    expect(
      inventoryCloudStorageBulk(SHIM_SHAM_INVENTORY, SHIM_SHAM_CONSUMABLES, {
        ...runtime,
        cloudStorage: DEFAULT_CLOUD_STORAGE,
      }),
    ).toBe(3);
  });

  it("hides stowed weapon strikes from strike lists", () => {
    const runtime = createDefaultRuntime(8);
    const level = requireLevelSnapshot(8);
    const all = buildWeaponStrikes(level);
    const stowedRuntime = { ...runtime, cloudStorage: DEFAULT_CLOUD_STORAGE };
    expect(isWeaponStrikeInCloudStorage(stowedRuntime, SHIM_SHAM_CONSUMABLES, "breaching-gun")).toBe(
      true,
    );
    const available = filterWeaponStrikesByCloudStorage(all, stowedRuntime, SHIM_SHAM_CONSUMABLES);
    expect(available.some((w) => w.id === "breaching-gun")).toBe(false);
    expect(available.some((w) => w.id === "rapier")).toBe(true);
  });

  it("clamps stowed consumables when used increases", () => {
    const cloud = normalizeCloudStorage(
      {
        cloudStorage: DEFAULT_CLOUD_STORAGE,
        consumables: { "medpatch-commercial": 8 },
      },
      SHIM_SHAM_CONSUMABLES,
    );
    expect(cloud.consumables["medpatch-commercial"]).toBe(0);
  });
});
