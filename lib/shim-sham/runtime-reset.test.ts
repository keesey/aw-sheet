import { describe, expect, it } from "vitest";
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
    };
    const reset = applyEncounterOffReset(runtime);
    expect(reset.panache).toBe(false);
    expect(reset.cover).toBe("none");
  });

  it("does not reset while in encounter", () => {
    const runtime = {
      ...createDefaultRuntime(),
      encounter: true,
      panache: true,
    };
    expect(applyEncounterOffReset(runtime).panache).toBe(true);
  });

  it("encounterOffPatch matches exploration reset fields", () => {
    expect(encounterOffPatch()).toMatchObject({
      encounter: false,
      ...explorationResetFields(),
    });
  });
});
