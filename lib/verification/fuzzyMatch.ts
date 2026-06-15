import { normalize, normalizeForComparison } from "./normalize";

export type FuzzyResult = {
  score: number;
  exact: boolean;
};

export function levenshteinDistance(a: string, b: string): number {
  const left = normalizeForComparison(a);
  const right = normalizeForComparison(b);

  if (left === right) {
    return 0;
  }

  if (!left.length) {
    return right.length;
  }

  if (!right.length) {
    return left.length;
  }

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = Array.from({ length: right.length + 1 }, () => 0);

  for (let i = 1; i <= left.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const substitutionCost = left[i - 1] === right[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + substitutionCost
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
}

export function fuzzyMatch(expected: string | undefined, found: string | undefined): FuzzyResult {
  const expectedNormalized = normalize(expected);
  const foundNormalized = normalize(found);

  if (!expectedNormalized || !foundNormalized) {
    return { score: 0, exact: false };
  }

  if (expectedNormalized === foundNormalized) {
    return { score: 1, exact: true };
  }

  if (
    expectedNormalized.includes(foundNormalized) ||
    foundNormalized.includes(expectedNormalized)
  ) {
    const shorter = Math.min(expectedNormalized.length, foundNormalized.length);
    const longer = Math.max(expectedNormalized.length, foundNormalized.length);
    return { score: Math.max(0.84, shorter / longer), exact: false };
  }

  const distance = levenshteinDistance(expectedNormalized, foundNormalized);
  const maxLength = Math.max(
    normalizeForComparison(expectedNormalized).length,
    normalizeForComparison(foundNormalized).length
  );

  return {
    score: maxLength === 0 ? 0 : Math.max(0, 1 - distance / maxLength),
    exact: false
  };
}
