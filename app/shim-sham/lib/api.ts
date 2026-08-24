import type { CharacterSheet } from "@/lib/types";

export async function patchSheet(body: Record<string, unknown>) {
  const res = await fetch("/api/shim-sham", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Save failed");
  }
  return res.json() as Promise<{ sheet: CharacterSheet; kvConfigured: boolean }>;
}
