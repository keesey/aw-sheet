import type { InventoryItem } from "@/lib/types";

const AON = "https://2e.aonsrd.com";

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
    notes: "Valuable",
    equipmentGroup: "other",
  },
  {
    id: "thermal-dynafan",
    name: "Thermal Dynafan",
    bulk: "—",
    notes: "Valuable",
    equipmentGroup: "other",
  },
];

const EQUIPMENT_GROUP_ORDER = ["armor", "weapon", "other"] as const;

const EQUIPMENT_GROUP_LABELS: Record<(typeof EQUIPMENT_GROUP_ORDER)[number], string> = {
  armor: "Armor",
  weapon: "Weapons",
  other: "Other",
};

export function getEquipmentGroups(items: InventoryItem[]) {
  return EQUIPMENT_GROUP_ORDER.map((group) => ({
    id: group,
    label: EQUIPMENT_GROUP_LABELS[group],
    items: items
      .filter((item) => item.equipmentGroup === group)
      .sort((a, b) => Number(a.indented ?? false) - Number(b.indented ?? false)),
  })).filter((group) => group.items.length > 0);
}
