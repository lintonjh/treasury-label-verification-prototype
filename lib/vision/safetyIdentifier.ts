function firstHeaderValue(value: string | null): string {
  return value?.split(",")[0]?.trim() || "unknown";
}

export async function buildSafetyIdentifier(request: Request): Promise<string> {
  const forwardedFor = firstHeaderValue(request.headers.get("x-forwarded-for"));
  const realIp = firstHeaderValue(request.headers.get("x-real-ip"));
  const userAgent = request.headers.get("user-agent") || "unknown";
  const seed = `${forwardedFor}|${realIp}|${userAgent}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed));

  return `demo_${Buffer.from(digest).toString("hex").slice(0, 32)}`;
}
