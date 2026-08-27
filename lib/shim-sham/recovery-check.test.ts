import { describe, expect, it } from "vitest";
import {
  evaluateRecoveryFlatCheck,
  recoveryCheckDc,
  applyRecoveryCheck,
} from "@/lib/shim-sham/recovery-check";

describe("recovery-check", () => {
  it("computes DC from dying value and Toughness", () => {
    expect(recoveryCheckDc(2, false)).toBe(12);
    expect(recoveryCheckDc(2, true)).toBe(11);
  });

  it("evaluates flat check outcomes", () => {
    expect(evaluateRecoveryFlatCheck(20, 15)).toBe("critical-success");
    expect(evaluateRecoveryFlatCheck(1, 15)).toBe("critical-failure");
    expect(evaluateRecoveryFlatCheck(15, 15)).toBe("success");
    expect(evaluateRecoveryFlatCheck(10, 15)).toBe("failure");
  });

  it("reduces dying on success", () => {
    const result = applyRecoveryCheck([{ id: "dying", value: 2 }], 0, 18, 6);
    expect(result.conditions.find((c) => c.id === "dying")?.value).toBe(1);
  });
});
