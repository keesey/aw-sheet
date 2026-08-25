import type { Consumable, InventoryItem, RuntimeState } from "@/lib/types";
import { normalizeAdHocItems, totalBulk } from "@/lib/shim-sham/bulk";

const AON = "https://2e.aonsrd.com";

/** Commercial-grade ammunition carried on the sheet (see AoN ammunition tables). */
export const SHIM_SHAM_AMMUNITION = {
  battery: { bulk: "—" },
  chemTank: { bulk: "—" },
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
    name: "Force Field",
    bulk: "—",
    url: `${AON}/treasure/57`,
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
    quantity: 1,
    used: 0,
    bulk: "L",
  },
  {
    id: "medpatch-commercial",
    name: "Medpatch (Commercial)",
    url: `${AON}/treasure/35-medpatch`,
    quantity: 3,
    used: 0,
    bulk: "L",
  },
  {
    id: "celebrity-serum",
    name: "Celebrity Serum",
    url: `${AON}/treasure/38-celebrity-serum`,
    quantity: 5,
    used: 0,
    bulk: "L",
  },
  {
    id: "incendiary-grenade",
    name: "Incendiary Grenade (Commercial)",
    url: `${AON}/treasure/104-incendiary-grenade`,
    quantity: 1,
    used: 0,
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
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
  })).filter((group) => group.items.length > 0);
}

type InventoryRuntime = Pick<
  RuntimeState,
  "consumables" | "batteries" | "chemTankCharges" | "adHocItems"
>;

/** One bulk entry per carried item (equipment piece, remaining consumable, battery, chem tank, ad hoc). */
function inventoryBulkItems(
  equipment: InventoryItem[],
  consumableCatalog: Consumable[],
  runtime: InventoryRuntime,
): { bulk: string }[] {
  const items: { bulk: string }[] = [...equipment];

  for (const consumable of consumableCatalog) {
    const used = runtime.consumables[consumable.id] ?? 0;
    const remaining = Math.max(0, consumable.quantity - used);
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
