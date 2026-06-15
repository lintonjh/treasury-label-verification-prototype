export function normalize(input: string | undefined | null): string {
  if (!input) {
    return "";
  }

  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\balc\.?\s*\/?\s*vol\.?\b/g, "alcohol volume")
    .replace(/[^a-z0-9%]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeForComparison(input: string | undefined | null): string {
  return normalize(input).replace(/[^a-z0-9]+/g, "");
}

export function includesNormalized(haystack: string | undefined, needle: string | undefined): boolean {
  const normalizedHaystack = normalize(haystack);
  const normalizedNeedle = normalize(needle);

  return Boolean(
    normalizedHaystack &&
      normalizedNeedle &&
      normalizedHaystack.includes(normalizedNeedle)
  );
}
