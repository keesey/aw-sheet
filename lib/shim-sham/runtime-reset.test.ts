import { describe, expect, it } from "vitest";
import { validatePatchBody } from "@/lib/shim-sham/patch-security";
import {
  applyEncounterOffReset,
  encounterOffPatch,
  explorationResetFields,
} from "@/lib/shim-sham/runtime-reset";
import { createDefaultRuntime } from "@/lib/shim-sham/static";

describe("runtime-reset", () => {
  it("clears combat toggles when encounter is off", () => {
    const runtime = {
      ...createDefaultRuntime(),
      encounter: false,
      panache: true,
      cover: "standard" as const,
      forceFieldActive: true,
      forceFieldHp: 12,
    };
    const reset = applyEncounterOffReset(runtime);
    expect(reset.panache).toBe(false);
    expect(reset.cover).toBe("none");
    expect(reset.forceFieldActive).toBe(false);
    expect(reset.forceFieldHp).toBe(0);
  });

  it("does not reset while in encounter", () => {
    const runtime = {
      ...createDefaultRuntime(),
      encounter: true,
      panache: true,
    };
    expect(applyEncounterOffReset(runtime).panache).toBe(true);
  });

  it("encounterOffPatch only includes client-direct fields", () => {
    const patch = encounterOffPatch();
    expect(patch).toMatchObject({
      encounter: false,
      panache: false,
      cover: "none",
    });
    expect(patch).not.toHaveProperty("forceFieldHp");
    expect(patch).not.toHaveProperty("forceFieldActive");
    expect(validatePatchBody(patch)).toBeNull();
  });

  it("explorationResetFields clears force field server-side", () => {
    expect(explorationResetFields()).toMatchObject({
      forceFieldActive: false,
      forceFieldHp: 0,
    });
  });
});
