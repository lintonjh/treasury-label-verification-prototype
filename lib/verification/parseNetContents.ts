export type NetContentsParseResult = {
  milliliters?: number;
};

export function parseNetContents(input: string | undefined | null): NetContentsParseResult {
  if (!input) {
    return {};
  }

  const text = input.toLowerCase().replace(/,/g, "");
  const literMatch = text.match(/(\d+(?:\.\d+)?)\s*l(?:iter|itre|iters|itres)?\b/);
  if (literMatch) {
    return { milliliters: Math.round(Number(literMatch[1]) * 1000) };
  }

  const mlMatch = text.match(/(\d+(?:\.\d+)?)\s*m\s*l\b/);
  if (mlMatch) {
    return { milliliters: Math.round(Number(mlMatch[1])) };
  }

  const clMatch = text.match(/(\d+(?:\.\d+)?)\s*c\s*l\b/);
  if (clMatch) {
    return { milliliters: Math.round(Number(clMatch[1]) * 10) };
  }

  return {};
}

export function netContentsEquivalent(expected: string, found: string): boolean {
  const expectedParsed = parseNetContents(expected);
  const foundParsed = parseNetContents(found);

  if (
    expectedParsed.milliliters === undefined ||
    foundParsed.milliliters === undefined
  ) {
    return false;
  }

  return Math.abs(expectedParsed.milliliters - foundParsed.milliliters) <= 1;
}
