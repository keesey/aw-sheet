import { describe, expect, it } from "vitest";
import { isAllowedAonUrl, sanitizeOptionalUrl } from "@/lib/shim-sham/url";

describe("isAllowedAonUrl", () => {
  it("accepts https AoN URLs", () => {
    expect(isAllowedAonUrl("https://2e.aonsrd.com/conditions/1-blinded")).toBe(true);
    expect(isAllowedAonUrl("https://2e.aonprd.com/equipment/1")).toBe(true);
  });

  it("rejects non-https and unknown hosts", () => {
    expect(isAllowedAonUrl("http://2e.aonsrd.com/conditions/1-blinded")).toBe(false);
    expect(isAllowedAonUrl("https://example.com/phish")).toBe(false);
    expect(isAllowedAonUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("sanitizeOptionalUrl", () => {
  it("returns undefined for invalid URLs", () => {
    expect(sanitizeOptionalUrl("https://evil.example/")).toBeUndefined();
    expect(sanitizeOptionalUrl("")).toBeUndefined();
  });

  it("keeps valid AoN URLs", () => {
    expect(sanitizeOptionalUrl(" https://2e.aonsrd.com/rules/179-bulk-values ")).toBe(
      "https://2e.aonsrd.com/rules/179-bulk-values",
    );
  });
});
