import type { Consumable, WeaponStrike } from "@/lib/types";

const AON = "https://2e.aonsrd.com";

export type AreaWeaponEntry = {
  id: string;
  name: string;
  url: string;
  burstRadius: string;
  damage: string;
  traits: string[];
  quantity?: string;
};

type AreaWeaponStats = {
  burstRadius: string;
  damage: string;
};

/**
 * Burst radius and damage by item id.
 * @see https://2e.aonsrd.com/treasure/104-incendiary-grenade
 */
const AREA_WEAPON_STATS: Record<string, AreaWeaponStats> = {
  "incendiary-grenade": { burstRadius: "5'", damage: "1d8 fire" },
};

function areaWeaponFromStats(
  id: string,
  name: string,
  url: string,
  traits: string[],
  quantity?: string,
): AreaWeaponEntry | null {
  const stats = AREA_WEAPON_STATS[id];
  if (!stats) {
    return null;
  }
  return {
    id,
    name,
    url,
    burstRadius: stats.burstRadius,
    damage: stats.damage,
    traits,
    quantity,
  };
}

export function buildAreaWeaponEntries(
  weapons: WeaponStrike[],
  consumableCatalog: Consumable[],
  consumablesUsed: Record<string, number>,
): AreaWeaponEntry[] {
  const fromWeapons = weapons
    .filter((weapon) => weapon.traits.some((trait) => trait.toLowerCase() === "area"))
    .map((weapon) =>
      areaWeaponFromStats(weapon.id, weapon.name, weapon.weaponUrl ?? weapon.url, weapon.traits),
    )
    .filter((entry): entry is AreaWeaponEntry => entry != null);

  const grenades = consumableCatalog
    .filter(
      (item) =>
        item.id.includes("grenade") ||
        item.name.toLowerCase().includes("grenade"),
    )
    .map((item) => {
      const used = consumablesUsed[item.id] ?? 0;
      return areaWeaponFromStats(
        item.id,
        item.name,
        item.url,
        ["Area", "Consumable"],
        `${item.quantity - used}/${item.quantity}`,
      );
    })
    .filter((entry): entry is AreaWeaponEntry => entry != null);

  return [...fromWeapons, ...grenades].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}
