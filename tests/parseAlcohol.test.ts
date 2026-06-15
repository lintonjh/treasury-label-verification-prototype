import { describe, expect, it } from "vitest";
import { alcoholEquivalent, parseAlcohol } from "@/lib/verification/parseAlcohol";

describe("parseAlcohol", () => {
  it("extracts ABV and proof from a combined statement", () => {
    expect(parseAlcohol("45% Alc./Vol. (90 Proof)")).toEqual({
      abv: 45,
      proof: 90
    });
  });

  it("derives proof from ABV-only statements", () => {
    expect(parseAlcohol("13.5% Alc./Vol.")).toEqual({
      abv: 13.5,
      proof: 27
    });
  });

  it("derives ABV from proof-only statements", () => {
    expect(parseAlcohol("90 Proof")).toEqual({
      abv: 45,
      proof: 90
    });
  });

  it("treats equivalent ABV and proof values as matches", () => {
    expect(alcoholEquivalent("45% Alc./Vol.", "90 Proof")).toBe(true);
  });

  it("honors the ABV tolerance boundary", () => {
    expect(alcoholEquivalent("45% Alc./Vol.", "45.2% Alc./Vol.")).toBe(true);
    expect(alcoholEquivalent("45% Alc./Vol.", "45.3% Alc./Vol.")).toBe(false);
  });

  it("rejects malformed or missing alcohol values", () => {
    expect(parseAlcohol("Barrel strength")).toEqual({});
    expect(alcoholEquivalent("45% Alc./Vol.", "Barrel strength")).toBe(false);
  });
});
