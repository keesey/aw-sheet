import type { CharacterSheet } from "@/lib/types";
import type { SheetPatch } from "@/lib/shim-sham/patch";

export async function patchSheet(body: SheetPatch) {
  const res = await fetch("/api/shim-sham", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.error === "string" ? err.error : "Save failed");
  }
  const data: unknown = await res.json();
  if (
    !data ||
    typeof data !== "object" ||
    !("sheet" in data) ||
    !("kvConfigured" in data) ||
    typeof (data as { kvConfigured: unknown }).kvConfigured !== "boolean"
  ) {
    throw new Error("Invalid save response");
  }
  return data as { sheet: CharacterSheet; kvConfigured: boolean };
}
