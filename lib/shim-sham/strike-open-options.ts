import type { StrikesWeaponFilter } from "@/lib/shim-sham/strikes";

export type StrikeDamageMode = "default" | "finisher";

export type StrikesOpenOptions = {
  damageMode: StrikeDamageMode;
  weaponFilter: StrikesWeaponFilter;
};

export const DEFAULT_STRIKES_OPEN: StrikesOpenOptions = {
  damageMode: "default",
  weaponFilter: "all",
};
