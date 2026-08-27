import type { SaveInput } from "@/lib/shim-sham/patch";

export type Panel = "levels" | "inventory" | "conditions" | null;

export type SpeedEntry = {
  label: string;
  value: number;
  /** Stylish Combatant / Vivacious Speed status bonus applies. */
  stylishBoost: boolean;
  accelerateBoost: boolean;
};

export type SaveFn = (patch: SaveInput) => Promise<void>;
