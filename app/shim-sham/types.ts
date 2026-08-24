export type Panel = "abilities" | "feats" | "inventory" | "conditions" | "manage" | null;

export type SpeedEntry = {
  label: string;
  value: number;
  /** Stylish Combatant / Vivacious Speed status bonus applies. */
  stylishBoost: boolean;
  accelerateBoost: boolean;
};

export type SaveFn = (body: Record<string, unknown>) => Promise<void>;
