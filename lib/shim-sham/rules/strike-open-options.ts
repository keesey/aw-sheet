import type { StrikesWeaponFilter } from "@/lib/shim-sham/rules/strikes";

export type StrikeDamageMode = "default" | "finisher";

export type StrikesOpenOptions = {
  damageMode: StrikeDamageMode;
  weaponFilter: StrikesWeaponFilter;
  /** Draw and Strike in one action — lists holstered/dropped weapons only. */
  quickDraw?: boolean;
};

export const DEFAULT_STRIKES_OPEN: StrikesOpenOptions = {
  damageMode: "default",
  weaponFilter: "all",
};
