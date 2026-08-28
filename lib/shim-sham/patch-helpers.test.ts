import { describe, expect, it } from "vitest";
import { validatePatchBody } from "@/lib/shim-sham/patch-security";
import { encounterOffPatch, restPatch } from "@/lib/shim-sham/runtime-reset";
import { createDefaultRuntime } from "@/lib/shim-sham/static";

/** Centralized patch builders sent from the client — add new helpers here. */
const CLIENT_PATCH_HELPERS = [
  { name: "encounterOffPatch", build: () => encounterOffPatch() },
  {
    name: "restPatch",
    build: () => restPatch(createDefaultRuntime()),
  },
] as const;

describe("client patch helpers", () => {
  it.each(CLIENT_PATCH_HELPERS)("$name passes validatePatchBody", ({ build }) => {
    expect(validatePatchBody(build())).toBeNull();
  });
});
