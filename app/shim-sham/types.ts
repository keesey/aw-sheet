import type { SaveInput } from "@/lib/shim-sham/rules/patch";

export type Panel = "levels" | "inventory" | "conditions" | null;

export type SaveFn = (patch: SaveInput) => Promise<void>;
