import type { CharacterSheet } from "@/lib/types";
import type { SheetPatch } from "@/lib/shim-sham/patch";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

async function readApiError(res: Response): Promise<string> {
  const err: unknown = await res.json().catch(() => ({}));
  if (err && typeof err === "object" && "error" in err && typeof err.error === "string") {
    return err.error;
  }
  return "Request failed";
}

export async function unlockSheet(token: string) {
  const res = await fetch("/api/shim-sham/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res));
  }
}

export async function patchSheet(body: SheetPatch) {
  const res = await fetch("/api/shim-sham", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    throw new UnauthorizedError(await readApiError(res));
  }
  if (!res.ok) {
    throw new Error(await readApiError(res));
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

export async function fetchSheet(signal?: AbortSignal) {
  const res = await fetch("/api/shim-sham", { signal });
  if (res.status === 401) {
    throw new UnauthorizedError(await readApiError(res));
  }
  if (!res.ok) {
    throw new Error(`Failed to load character sheet (${res.status})`);
  }
  return res.json() as Promise<unknown>;
}
