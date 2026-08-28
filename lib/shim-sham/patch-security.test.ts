import { describe, expect, it } from "vitest";
import { validatePatchBody } from "@/lib/shim-sham/patch-security";

describe("validatePatchBody", () => {
  it("allows direct toggle patches", () => {
    expect(validatePatchBody({ panache: true })).toBeNull();
  });

  it("rejects server-owned fields", () => {
    expect(validatePatchBody({ level: 10 })).toMatch(/level/);
    expect(validatePatchBody({ forceFieldUsesUsed: 0 })).toMatch(/forceFieldUsesUsed/);
  });

  it("requires hp-delta for forceFieldHp input", () => {
    expect(validatePatchBody({ forceFieldHp: 5 })).toMatch(/forceFieldHp/);
    expect(
      validatePatchBody({
        action: "hp-delta",
        delta: -1,
        currentHp: 10,
        forceFieldHp: 5,
      }),
    ).toBeNull();
  });

  it("rejects clearing meyel reroll outside rest", () => {
    expect(validatePatchBody({ meyelRerollUsed: false })).toMatch(/meyelRerollUsed/);
  });
});
