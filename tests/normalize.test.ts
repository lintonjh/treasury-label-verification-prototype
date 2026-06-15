import { describe, expect, it } from "vitest";
import { normalize, normalizeForComparison } from "@/lib/verification/normalize";
import { fuzzyMatch } from "@/lib/verification/fuzzyMatch";

describe("normalize", () => {
  it("handles punctuation and case", () => {
    expect(normalize("45% Alc./Vol. (90 Proof)")).toBe("45% alcohol volume 90 proof");
  });

  it("creates compact comparison values", () => {
    expect(normalizeForComparison("Old Tom Distillery, LLC")).toBe("oldtomdistilleryllc");
  });

  it("scores nearby brand names as close but not exact", () => {
    const match = fuzzyMatch("Old Tom Distillery", "Old Tom Distilling");
    expect(match.exact).toBe(false);
    expect(match.score).toBeGreaterThan(0.72);
    expect(match.score).toBeLessThan(0.92);
  });

  it("scores exact comparison values as exact matches", () => {
    expect(fuzzyMatch("Old Tom Distillery, LLC", "old tom distillery llc")).toEqual({
      exact: true,
      score: 1
    });
  });

  it("scores empty or clearly different values as failures", () => {
    expect(fuzzyMatch("Old Tom Distillery", "").score).toBe(0);
    expect(fuzzyMatch("Old Tom Distillery", "Bay Fog Winery").score).toBeLessThan(0.72);
  });
});
