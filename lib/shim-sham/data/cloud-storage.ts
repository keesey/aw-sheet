import type { CloudStorageState, Consumable, RuntimeState, WeaponStrike } from "@/lib/types";

export const CLOUD_STORAGE_PARTNER = "UV Nova";
/** Level of the character who has Cloud Storage (capacity is based on their level). */
export const CLOUD_STORAGE_BOND_LEVEL = 8;
export const CLOUD_STORAGE_FEAT_URL = "https://2e.aonsrd.com/Feats/494";

/** Cloud Storage capacity by bond member level (Player Core). */
export function cloudStorageCapacity(bondMemberLevel: number): number {
  if (bondMemberLevel >= 16) return 75;
  if (bondMemberLevel >= 12) return 50;
  if (bondMemberLevel >= 8) return 25;
  return 12;
}

/** Strike id → inventory item id (items not listed are always available, e.g. unarmed). */
export const STRIKE_INVENTORY_ITEM: Record<string, string> = {
  baton: "baton-item",
  "battle-ribbon": "battle-ribbon-item",
  rapier: "rapier-item",
  tailblade: "tailblade-item",
  "zero-pistol": "zero-pistol-item",
  "breaching-gun": "breaching-gun-item",
  crossbolter: "crossbolter-item",
  "reinforced-stock": "reinforced-stock",
};

/** Attached strikes unavailable when the parent item is stowed. */
const STRIKE_CLOUD_PARENT: Record<string, string> = {
  "reinforced-stock": "crossbolter-item",
};

/** Keep in sync with `SHIM_SHAM_INVENTORY` ids (avoid importing inventory — circular deps). */
const STOWABLE_EQUIPMENT_IDS = new Set([
  "tempweave",
  "jetpack",
  "force-field",
  "tailblade-item",
  "rapier-item",
  "baton-item",
  "zero-pistol-item",
  "breaching-gun-item",
  "bipod-breaching-gun",
  "crossbolter-item",
  "reinforced-stock",
  "battle-ribbon-item",
  "infiltrator-tools",
  "wayfinder",
  "adaptine-gel",
  "thermal-dynafan",
]);

export const DEFAULT_CLOUD_STORAGE: CloudStorageState = {
  equipmentIds: ["breaching-gun-item", "bipod-breaching-gun"],
  consumables: {
    "medpatch-commercial": 6,
    "medpatch-tactical": 2,
    "celebrity-serum": 2,
  },
};

export function normalizeCloudStorage(
  runtime: Pick<RuntimeState, "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
): CloudStorageState {
  const raw = runtime.cloudStorage ?? DEFAULT_CLOUD_STORAGE;
  const equipmentIds = [...new Set(raw.equipmentIds.filter((id) => STOWABLE_EQUIPMENT_IDS.has(id)))];

  const consumables: Record<string, number> = {};
  for (const consumable of consumableCatalog) {
    const used = Math.max(0, Math.floor(runtime.consumables[consumable.id] ?? 0));
    const requested = Math.max(0, Math.floor(raw.consumables[consumable.id] ?? 0));
    const maxStowed = Math.max(0, consumable.quantity - used);
    consumables[consumable.id] = Math.min(requested, maxStowed);
  }

  return { equipmentIds, consumables };
}

export function isEquipmentInCloudStorage(cloud: CloudStorageState, itemId: string): boolean {
  return cloud.equipmentIds.includes(itemId);
}

export function stowedConsumableCount(cloud: CloudStorageState, consumableId: string): number {
  return cloud.consumables[consumableId] ?? 0;
}

export function carriedConsumableCount(
  consumable: Consumable,
  runtime: Pick<RuntimeState, "consumables">,
  cloud: CloudStorageState,
): number {
  const used = Math.max(0, runtime.consumables[consumable.id] ?? 0);
  const stowed = stowedConsumableCount(cloud, consumable.id);
  return Math.max(0, consumable.quantity - used - stowed);
}

export function toggleEquipmentInCloudStorage(
  cloud: CloudStorageState,
  itemId: string,
): CloudStorageState {
  if (!STOWABLE_EQUIPMENT_IDS.has(itemId)) return cloud;
  const ids = new Set(cloud.equipmentIds);
  if (ids.has(itemId)) ids.delete(itemId);
  else ids.add(itemId);
  return { ...cloud, equipmentIds: [...ids] };
}

export function adjustStowedConsumable(
  cloud: CloudStorageState,
  consumable: Consumable,
  used: number,
  delta: number,
): CloudStorageState {
  const current = stowedConsumableCount(cloud, consumable.id);
  const maxStowed = Math.max(0, consumable.quantity - used);
  const next = Math.max(0, Math.min(maxStowed, current + delta));
  return {
    ...cloud,
    consumables: { ...cloud.consumables, [consumable.id]: next },
  };
}

export function isWeaponStrikeInCloudStorage(
  runtime: Pick<RuntimeState, "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
  strikeId: string,
): boolean {
  const cloud = normalizeCloudStorage(runtime, consumableCatalog);
  const itemId = STRIKE_INVENTORY_ITEM[strikeId];
  const parentId = STRIKE_CLOUD_PARENT[strikeId];
  if (parentId && isEquipmentInCloudStorage(cloud, parentId)) return true;
  if (!itemId) return false;
  return isEquipmentInCloudStorage(cloud, itemId);
}

export function filterWeaponStrikesByCloudStorage(
  weapons: WeaponStrike[],
  runtime: Pick<RuntimeState, "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
): WeaponStrike[] {
  return weapons.filter(
    (weapon) => !isWeaponStrikeInCloudStorage(runtime, consumableCatalog, weapon.id),
  );
}

export function isBreachingGunInCloudStorage(
  runtime: Pick<RuntimeState, "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
): boolean {
  return isWeaponStrikeInCloudStorage(runtime, consumableCatalog, "breaching-gun");
}

export function isBipodUnavailableInCloudStorage(
  runtime: Pick<RuntimeState, "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
): boolean {
  const cloud = normalizeCloudStorage(runtime, consumableCatalog);
  return (
    isEquipmentInCloudStorage(cloud, "bipod-breaching-gun") ||
    isEquipmentInCloudStorage(cloud, "breaching-gun-item")
  );
}
