import { describe, expect, it } from "vitest";
import { parseSheetPatch, parseLocalRuntime } from "@/lib/shim-sham/patch";

describe("parseSheetPatch", () => {
  it("accepts a valid toggle patch", () => {
    expect(parseSheetPatch({ panache: true })).toEqual({ panache: true });
  });

  it("accepts a rest action patch", () => {
    expect(parseSheetPatch({ action: "rest", currentHp: 42 })).toEqual({
      action: "rest",
      currentHp: 42,
    });
  });

  it("rejects unknown actions", () => {
    expect(parseSheetPatch({ action: "invalid" })).toBeNull();
  });

  it("ignores malformed condition entries", () => {
    expect(parseSheetPatch({ conditions: [{ id: 1 }] })).toEqual({});
  });
});

describe("parseLocalRuntime", () => {
  it("parses valid runtime JSON", () => {
    const runtime = {
      level: 1,
      currentHp: 10,
      encounter: false,
      conditions: [],
    };
    expect(parseLocalRuntime(JSON.stringify(runtime))).toEqual(runtime);
  });

  it("returns null for corrupt JSON", () => {
    expect(parseLocalRuntime("{not json")).toBeNull();
  });
});
