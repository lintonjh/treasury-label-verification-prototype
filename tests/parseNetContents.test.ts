import { describe, expect, it } from "vitest";
import { netContentsEquivalent, parseNetContents } from "@/lib/verification/parseNetContents";

describe("parseNetContents", () => {
  it("parses milliliters", () => {
    expect(parseNetContents("750 mL")).toEqual({ milliliters: 750 });
  });

  it("normalizes liters and milliliters", () => {
    expect(netContentsEquivalent("0.75 L", "750ml")).toBe(true);
  });

  it("normalizes centiliters and milliliters", () => {
    expect(netContentsEquivalent("750 mL", "75 cL")).toBe(true);
  });

  it("honors the one milliliter tolerance boundary", () => {
    expect(netContentsEquivalent("750 mL", "751 mL")).toBe(true);
    expect(netContentsEquivalent("750 mL", "752 mL")).toBe(false);
  });

  it("rejects mismatched, malformed, or missing net contents", () => {
    expect(netContentsEquivalent("750 mL", "375 mL")).toBe(false);
    expect(parseNetContents("one bottle")).toEqual({});
    expect(netContentsEquivalent("750 mL", "one bottle")).toBe(false);
  });
});
