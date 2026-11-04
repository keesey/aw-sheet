import type { Consumable, InventoryItem, RuntimeState } from "@/lib/types";
import { normalizeAdHocItems, totalBulk } from "@/lib/shim-sham/data/bulk";
import {
  isEquipmentInCloudStorage,
  normalizeCloudStorage,
  stowedConsumableCount,
} from "@/lib/shim-sham/data/cloud-storage";

import { AON, AONP } from "@/lib/shim-sham/aon";
import { compareByName } from "@/lib/shim-sham/sort";
export const SHIM_SHAM_AMMUNITION = {
  battery: { bulk: "—" },
  chemTank: { bulk: "—" },
  breachingGun: { bulk: "—", magazineMax: 3 },
  crossbolter: { bulk: "—", magazineMax: 1 },
  projectile: { bulk: "—" },
} as const;

export const SHIM_SHAM_INVENTORY: InventoryItem[] = [
  {
    id: "tempweave",
    name: "Tempweave (Advanced)",
    bulk: "1",
    url: `${AON}/equipment/armor/11-tempweave`,
    traits: ["Tech"],
    equipmentGroup: "armor",
  },
  {
    id: "jetpack",
    name: "Jetpack",
    bulk: "L",
    url: `${AON}/treasure/59-jetpack`,
    traits: ["Tech"],
    equipmentGroup: "armor",
    indented: true,
  },
  {
    id: "force-field",
    name: "Force Field (Tactical)",
    bulk: "—",
    url: `${AON}/treasure/57-force-field`,
    traits: ["Tech"],
    equipmentGroup: "armor",
    indented: true,
  },
  {
    id: "tailblade-item",
    name: "Tailblade (Advanced)",
    bulk: "L",
    url: `${AON}/equipment/weapons/29-tailblade`,
    traits: ["Agile", "Analog", "Finesse", "Free-hand"],
    equipmentGroup: "weapon",
  },
  {
    id: "rapier-item",
    name: "Nano-Edge Rapier (Advanced)",
    bulk: "1",
    url: `${AON}/equipment/weapons/17-nano-edge-rapier`,
    traits: ["Analog", "Deadly d8", "Disarm", "Finesse"],
    equipmentGroup: "weapon",
  },
  {
    id: "baton-item",
    name: "Baton (Tactical)",
    bulk: "L",
    url: `${AON}/equipment/weapons/2-baton`,
    traits: ["Analog", "Finesse", "Nonlethal", "Parry"],
    equipmentGroup: "weapon",
  },
  {
    id: "zero-pistol-item",
    name: "Zero Pistol (Advanced)",
    bulk: "L",
    url: `${AON}/equipment/weapons/48-zero-pistol`,
    traits: ["Tech"],
    equipmentGroup: "weapon",
  },
  {
    id: "breaching-gun-item",
    name: "Breaching Gun (Advanced)",
    bulk: "1",
    url: `${AON}/equipment/weapons/52-breaching-gun`,
    traits: ["Analog", "Concussive", "Kickback", "Ranged Shove", "Razing"],
    equipmentGroup: "weapon",
  },
  {
    id: "bipod-breaching-gun",
    name: "Bipod (Tactical)",
    bulk: "1",
    url: `${AON}/treasure/65-bipod`,
    traits: ["Tech"],
    equipmentGroup: "weapon",
    indented: true,
  },
  {
    id: "crossbolter-item",
    name: "Crossbolter (Advanced)",
    bulk: "2",
    url: `${AON}/equipment/weapons/39-crossbolter`,
    traits: ["Analog"],
    equipmentGroup: "weapon",
  },
  {
    id: "reinforced-stock",
    name: "Reinforced Stock (Advanced)",
    bulk: "L",
    url: `${AONP}/Weapons.aspx?ID=187`,
    traits: ["Analog", "Attached", "Finesse"],
    equipmentGroup: "weapon",
    indented: true,
  },
  {
    id: "battle-ribbon-item",
    name: "Battle Ribbon",
    bulk: "L",
    url: `${AON}/equipment/weapons/9-battle-ribbon`,
    traits: ["Analog", "Disarm", "Finesse", "Nonlethal", "Reach", "Trip"],
    equipmentGroup: "weapon",
  },
  {
    id: "infiltrator-tools",
    name: "Infiltrator's Toolkit",
    bulk: "L",
    url: `${AON}/treasure/20`,
    equipmentGroup: "other",
  },
  {
    id: "wayfinder",
    name: "Wayfinder",
    bulk: "—",
    url: `${AONP}/Equipment.aspx?ID=3117`,
    traits: ["Invested", "Magical"],
    equipmentGroup: "other",
  },
  {
    id: "adaptine-gel",
    name: "Adaptine Weapon Gel",
    bulk: "—",
    equipmentGroup: "valuable",
  },
  {
    id: "thermal-dynafan",
    name: "Thermal Dynafan",
    bulk: "—",
    url: `${AON}/equipment/weapons/34-thermal-dynafan`,
    equipmentGroup: "valuable",
  },
];

export const SHIM_SHAM_CONSUMABLES: Consumable[] = [
  {
    id: "medpatch-tactical",
    name: "Medpatch (Tactical)",
    url: `${AON}/treasure/35-medpatch`,
    quantity: 8,
    bulk: "L",
  },
  {
    id: "medpatch-commercial",
    name: "Medpatch (Commercial)",
    url: `${AON}/treasure/35-medpatch`,
    quantity: 8,
    bulk: "L",
  },
  {
    id: "celebrity-serum",
    name: "Celebrity Serum",
    url: `${AON}/treasure/38-celebrity-serum`,
    quantity: 4,
    bulk: "L",
  },
  {
    id: "incendiary-grenade",
    name: "Incendiary Grenade (Commercial)",
    url: `${AON}/treasure/104-incendiary-grenade`,
    quantity: 1,
    bulk: "L",
  },
];

const EQUIPMENT_GROUP_ORDER = ["armor", "weapon", "other", "valuable"] as const;

const EQUIPMENT_GROUP_LABELS: Record<(typeof EQUIPMENT_GROUP_ORDER)[number], string> = {
  armor: "Armor",
  weapon: "Weapons",
  other: "Other Equipment",
  valuable: "Valuables",
};

export function getEquipmentGroups(items: InventoryItem[]) {
  return EQUIPMENT_GROUP_ORDER.map((group) => ({
    id: group,
    label: EQUIPMENT_GROUP_LABELS[group],
    items: items
      .filter((item) => item.equipmentGroup === group)
      .sort(compareByName),
  })).filter((group) => group.items.length > 0);
}

type InventoryRuntime = Pick<
  RuntimeState,
  "consumables" | "batteries" | "chemTankCharges" | "adHocItems" | "cloudStorage"
>;

/** One bulk entry per carried item (equipment piece, remaining consumable, battery, chem tank, ad hoc). */
function inventoryBulkItems(
  equipment: InventoryItem[],
  consumableCatalog: Consumable[],
  runtime: InventoryRuntime,
): { bulk: string }[] {
  const cloud = normalizeCloudStorage(runtime, consumableCatalog);
  const items: { bulk: string }[] = equipment.filter(
    (item) => !isEquipmentInCloudStorage(cloud, item.id),
  );

  for (const consumable of consumableCatalog) {
    const used = runtime.consumables[consumable.id] ?? 0;
    const stowed = stowedConsumableCount(cloud, consumable.id);
    const remaining = Math.max(0, consumable.quantity - used - stowed);
    for (let i = 0; i < remaining; i++) {
      items.push({ bulk: consumable.bulk });
    }
  }

  for (const _battery of runtime.batteries) {
    items.push({ bulk: SHIM_SHAM_AMMUNITION.battery.bulk });
  }

  items.push({ bulk: SHIM_SHAM_AMMUNITION.chemTank.bulk });

  for (const item of normalizeAdHocItems(runtime.adHocItems)) {
    items.push({ bulk: item.bulk });
  }

  return items;
}

export function inventoryTotalBulk(
  equipment: InventoryItem[],
  consumableCatalog: Consumable[],
  runtime: InventoryRuntime,
): number {
  return totalBulk(inventoryBulkItems(equipment, consumableCatalog, runtime));
}

function inventoryCloudStorageBulkItems(
  equipment: InventoryItem[],
  consumableCatalog: Consumable[],
  runtime: InventoryRuntime,
): { bulk: string }[] {
  const cloud = normalizeCloudStorage(runtime, consumableCatalog);
  const items: { bulk: string }[] = equipment
    .filter((item) => isEquipmentInCloudStorage(cloud, item.id))
    .map((item) => ({ bulk: item.bulk }));

  for (const consumable of consumableCatalog) {
    const stowed = stowedConsumableCount(cloud, consumable.id);
    for (let i = 0; i < stowed; i++) {
      items.push({ bulk: consumable.bulk });
    }
  }

  return items;
}

/** Bulk of gear stowed in party Cloud Storage (same rounding as carried bulk). */
export function inventoryCloudStorageBulk(
  equipment: InventoryItem[],
  consumableCatalog: Consumable[],
  runtime: InventoryRuntime,
): number {
  return totalBulk(inventoryCloudStorageBulkItems(equipment, consumableCatalog, runtime));
}
