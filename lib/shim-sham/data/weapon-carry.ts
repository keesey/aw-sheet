import type { Consumable, RuntimeState, WeaponCarryState, WeaponStrike } from "@/lib/types";
import {
  isWeaponStrikeInCloudStorage,
  STRIKE_INVENTORY_ITEM,
} from "@/lib/shim-sham/data/cloud-storage";

/** Always ready; cannot sheathe or drop. */
export const ALWAYS_DRAWN_STRIKE_IDS = new Set(["tailblade", "jaws"]);

/** Use parent strike's carry state (attached weapon). */
const CARRY_STATE_PARENT_STRIKE: Record<string, string> = {
  "reinforced-stock": "crossbolter",
};

export function isAlwaysDrawnStrike(strikeId: string): boolean {
  return ALWAYS_DRAWN_STRIKE_IDS.has(strikeId);
}

function carryStateKey(strikeId: string): string {
  return CARRY_STATE_PARENT_STRIKE[strikeId] ?? strikeId;
}

export function getWeaponCarryState(
  runtime: Pick<RuntimeState, "weaponCarry" | "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
  strikeId: string,
): WeaponCarryState | "cloud" {
  if (isWeaponStrikeInCloudStorage(runtime, consumableCatalog, strikeId)) {
    return "cloud";
  }
  if (isAlwaysDrawnStrike(strikeId)) {
    return "drawn";
  }
  const key = carryStateKey(strikeId);
  return runtime.weaponCarry?.[key] ?? "stowed";
}

export function isStrikeDrawnForAttack(
  runtime: Pick<RuntimeState, "weaponCarry" | "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
  strikeId: string,
): boolean {
  return getWeaponCarryState(runtime, consumableCatalog, strikeId) === "drawn";
}

export function canDrawWeaponStrike(
  runtime: Pick<RuntimeState, "weaponCarry" | "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
  strikeId: string,
): boolean {
  if (isAlwaysDrawnStrike(strikeId)) return false;
  const state = getWeaponCarryState(runtime, consumableCatalog, strikeId);
  return state === "stowed" || state === "dropped";
}

export function canSheatheWeaponStrike(
  runtime: Pick<RuntimeState, "weaponCarry" | "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
  strikeId: string,
): boolean {
  if (isAlwaysDrawnStrike(strikeId)) return false;
  return getWeaponCarryState(runtime, consumableCatalog, strikeId) === "drawn";
}

export function canDropWeaponStrike(
  runtime: Pick<RuntimeState, "weaponCarry" | "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
  strikeId: string,
): boolean {
  if (isAlwaysDrawnStrike(strikeId)) return false;
  const state = getWeaponCarryState(runtime, consumableCatalog, strikeId);
  return state === "stowed" || state === "drawn";
}

export function filterDrawnWeaponStrikes(
  weapons: WeaponStrike[],
  runtime: Pick<RuntimeState, "weaponCarry" | "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
): WeaponStrike[] {
  return weapons.filter((weapon) =>
    isStrikeDrawnForAttack(runtime, consumableCatalog, weapon.id),
  );
}

export function filterQuickDrawWeaponStrikes(
  weapons: WeaponStrike[],
  runtime: Pick<RuntimeState, "weaponCarry" | "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
): WeaponStrike[] {
  return weapons.filter((weapon) =>
    canDrawWeaponStrike(runtime, consumableCatalog, weapon.id),
  );
}

export function listManageableWeaponStrikes(
  runtime: Pick<RuntimeState, "weaponCarry" | "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
  weapons: WeaponStrike[],
): WeaponStrike[] {
  return weapons.filter(
    (weapon) =>
      !isAlwaysDrawnStrike(weapon.id) &&
      getWeaponCarryState(runtime, consumableCatalog, weapon.id) !== "cloud",
  );
}

export function strikeIdsForInventoryItem(itemId: string): string[] {
  return Object.entries(STRIKE_INVENTORY_ITEM)
    .filter(([, invId]) => invId === itemId)
    .map(([strikeId]) => strikeId);
}

export function normalizeWeaponCarry(
  runtime: Pick<RuntimeState, "weaponCarry" | "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
): Record<string, WeaponCarryState> {
  const carry: Record<string, WeaponCarryState> = { ...(runtime.weaponCarry ?? {}) };
  for (const strikeId of Object.keys(STRIKE_INVENTORY_ITEM)) {
    if (isAlwaysDrawnStrike(strikeId)) {
      delete carry[strikeId];
      continue;
    }
    if (isWeaponStrikeInCloudStorage(runtime, consumableCatalog, strikeId)) {
      delete carry[carryStateKey(strikeId)];
    }
  }
  for (const [strikeId, state] of Object.entries(carry)) {
    if (state !== "stowed" && state !== "drawn" && state !== "dropped") {
      delete carry[strikeId];
    }
  }
  return carry;
}

function setCarryState(
  carry: Record<string, WeaponCarryState>,
  strikeId: string,
  state: WeaponCarryState,
): Record<string, WeaponCarryState> {
  const key = carryStateKey(strikeId);
  if (isAlwaysDrawnStrike(key)) return carry;
  return { ...carry, [key]: state };
}

export function drawWeaponStrikePatch(
  runtime: RuntimeState,
  consumableCatalog: Consumable[],
  strikeId: string,
): Partial<RuntimeState> | null {
  if (!canDrawWeaponStrike(runtime, consumableCatalog, strikeId)) return null;
  const weaponCarry = setCarryState(
    normalizeWeaponCarry(runtime, consumableCatalog),
    strikeId,
    "drawn",
  );
  return { weaponCarry };
}

export function sheatheWeaponStrikePatch(
  runtime: RuntimeState,
  consumableCatalog: Consumable[],
  strikeId: string,
): Partial<RuntimeState> | null {
  if (!canSheatheWeaponStrike(runtime, consumableCatalog, strikeId)) return null;
  const weaponCarry = setCarryState(
    normalizeWeaponCarry(runtime, consumableCatalog),
    strikeId,
    "stowed",
  );
  return { weaponCarry };
}

export function dropWeaponStrikePatch(
  runtime: RuntimeState,
  consumableCatalog: Consumable[],
  strikeId: string,
): Partial<RuntimeState> | null {
  if (!canDropWeaponStrike(runtime, consumableCatalog, strikeId)) return null;
  const weaponCarry = setCarryState(
    normalizeWeaponCarry(runtime, consumableCatalog),
    strikeId,
    "dropped",
  );
  return { weaponCarry };
}

/** When gear leaves Cloud Storage, it arrives drawn. */
export function drawStrikesForInventoryItemPatch(
  runtime: RuntimeState,
  consumableCatalog: Consumable[],
  itemId: string,
): Partial<RuntimeState> {
  let weaponCarry = normalizeWeaponCarry(runtime, consumableCatalog);
  for (const strikeId of strikeIdsForInventoryItem(itemId)) {
    if (isAlwaysDrawnStrike(strikeId)) continue;
    if (isWeaponStrikeInCloudStorage(runtime, consumableCatalog, strikeId)) continue;
    weaponCarry = setCarryState(weaponCarry, strikeId, "drawn");
  }
  return { weaponCarry };
}

export function carryStateLabel(
  runtime: Pick<RuntimeState, "weaponCarry" | "cloudStorage" | "consumables">,
  consumableCatalog: Consumable[],
  strikeId: string,
): string | null {
  if (!STRIKE_INVENTORY_ITEM[strikeId] && !CARRY_STATE_PARENT_STRIKE[strikeId]) {
    return null;
  }
  const state = getWeaponCarryState(runtime, consumableCatalog, strikeId);
  if (state === "cloud") return "Cloud";
  if (isAlwaysDrawnStrike(strikeId)) return "Drawn";
  switch (state) {
    case "drawn":
      return "Drawn";
    case "dropped":
      return "Dropped";
    default:
      return "Stowed";
  }
}

export function primaryStrikeIdForInventoryItem(itemId: string): string | null {
  const ids = strikeIdsForInventoryItem(itemId);
  return ids[0] ?? null;
}
