export type AlcoholParseResult = {
  abv?: number;
  proof?: number;
};

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

export function parseAlcohol(input: string | undefined | null): AlcoholParseResult {
  if (!input) {
    return {};
  }

  const text = input.toLowerCase();
  const result: AlcoholParseResult = {};

  const percentMatch =
    text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:alc|alcohol)?\.?\s*(?:\/?\s*vol\.?)?/) ||
    text.match(/(\d+(?:\.\d+)?)\s*(?:abv|alc\.?\s*\/?\s*vol\.?)/);

  if (percentMatch) {
    result.abv = Number(percentMatch[1]);
  }

  const proofMatch = text.match(/(\d+(?:\.\d+)?)\s*proof/);
  if (proofMatch) {
    result.proof = Number(proofMatch[1]);
  }

  if (result.abv !== undefined && result.proof === undefined) {
    result.proof = roundOne(result.abv * 2);
  }

  if (result.proof !== undefined && result.abv === undefined) {
    result.abv = roundOne(result.proof / 2);
  }

  return result;
}

export function alcoholEquivalent(expected: string, found: string): boolean {
  const expectedParsed = parseAlcohol(expected);
  const foundParsed = parseAlcohol(found);

  if (expectedParsed.abv === undefined || foundParsed.abv === undefined) {
    return false;
  }

  return Math.abs(expectedParsed.abv - foundParsed.abv) <= 0.2 + 1e-9;
}
