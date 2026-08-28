import { describe, expect, it } from "vitest";
import {
  normalizeConditions,
  removeCondition,
  toggleCondition,
} from "@/lib/shim-sham/rules/conditions";

describe("conditions", () => {
  it("normalizes string condition ids", () => {
    expect(normalizeConditions(["prone"])).toEqual([{ id: "prone" }]);
  });

  it("toggles valued conditions on and off", () => {
    const added = toggleCondition([], "frightened");
    expect(added).toEqual([{ id: "frightened", value: 1 }]);
    expect(toggleCondition(added, "frightened")).toEqual([]);
  });

  it("removes a condition by id", () => {
    const withProne = toggleCondition([], "prone");
    expect(removeCondition(withProne, "prone")).toEqual([]);
  });
});
