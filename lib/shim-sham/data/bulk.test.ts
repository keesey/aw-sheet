import { describe, expect, it } from "vitest";
import {
  bulkToUnits,
  isEncumberedByBulk,
  maxBulkCapacity,
  totalBulk,
} from "@/lib/shim-sham/data/bulk";

describe("bulk", () => {
  it("converts bulk labels to units", () => {
    expect(bulkToUnits("—")).toBe(0);
    expect(bulkToUnits("L")).toBe(0.1);
    expect(bulkToUnits("2")).toBe(2);
  });

  it("sums item bulk", () => {
    expect(totalBulk([{ bulk: "L" }, { bulk: "1" }])).toBe(1);
  });

  it("computes max capacity from STR modifier", () => {
    expect(maxBulkCapacity(3)).toBe(13);
  });

  it("detects encumbrance at 5 + STR mod", () => {
    expect(isEncumberedByBulk(5, 0)).toBe(true);
    expect(isEncumberedByBulk(4, 0)).toBe(false);
  });
});
