/** Archives of Nethys base URLs for Starfinder 2e / PF2 content. */
export const AON = "https://2e.aonsrd.com";
export const AONP = "https://2e.aonprd.com";

export function aonEquipment(path: string): string {
  return `${AON}/equipment/${path}`;
}

export function aonTreasure(path: string): string {
  return `${AON}/treasure/${path}`;
}

export function aonAmmunition(path: string): string {
  return `${AON}/equipment/ammunition/${path}`;
}
