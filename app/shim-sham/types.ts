export type Panel = "actions" | "abilities" | "inventory" | "conditions" | "manage" | null;

export type SpeedEntry = {
  label: string;
  value: number;
  panacheBoost: boolean;
  accelerateBoost: boolean;
};

export type SaveFn = (body: Record<string, unknown>) => Promise<void>;
