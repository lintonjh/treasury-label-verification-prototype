const minuteMs = 60 * 1000;
const hourMs = 60 * minuteMs;
const dayMs = 24 * hourMs;

type UsageCounter = {
  count: number;
  resetAt: number;
};

type UsageLimits = {
  perMinute: number;
  perHour: number;
  perDay: number;
};

const counters: Record<keyof UsageLimits, UsageCounter> = {
  perMinute: { count: 0, resetAt: 0 },
  perHour: { count: 0, resetAt: 0 },
  perDay: { count: 0, resetAt: 0 }
};

export class OpenAIUsageLimitError extends Error {
  constructor(public readonly safeMessage: string) {
    super(safeMessage);
  }
}

function readNonNegativeInteger(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function readPositiveInteger(name: string, fallback: number): number {
  const value = readNonNegativeInteger(name, fallback);
  return value > 0 ? value : fallback;
}

export function getOpenAIUsageLimits(): UsageLimits {
  return {
    perMinute: readNonNegativeInteger("OPENAI_DEMO_MAX_REQUESTS_PER_MINUTE", 3),
    perHour: readNonNegativeInteger("OPENAI_DEMO_MAX_REQUESTS_PER_HOUR", 30),
    perDay: readNonNegativeInteger("OPENAI_DEMO_MAX_REQUESTS_PER_DAY", 100)
  };
}

export function getOpenAIMaxOutputTokens(): number {
  return readPositiveInteger("OPENAI_MAX_OUTPUT_TOKENS", 700);
}

export function getOpenAIRequestTimeoutMs(): number {
  return readPositiveInteger("OPENAI_REQUEST_TIMEOUT_MS", 20_000);
}

function resetCounterIfNeeded(counter: UsageCounter, now: number, windowMs: number) {
  if (counter.resetAt === 0 || now >= counter.resetAt) {
    counter.count = 0;
    counter.resetAt = now + windowMs;
  }
}

function assertCounterAllowsRequest(
  counter: UsageCounter,
  limit: number,
  unitLabel: string
) {
  if (limit === 0 || counter.count >= limit) {
    throw new OpenAIUsageLimitError(
      `Live AI demo limit reached (${limit} request${limit === 1 ? "" : "s"} per ${unitLabel}). Please try again later or ask the administrator to raise the demo limit.`
    );
  }
}

export function consumeOpenAIUsageSlot(now = Date.now()) {
  const limits = getOpenAIUsageLimits();

  resetCounterIfNeeded(counters.perMinute, now, minuteMs);
  resetCounterIfNeeded(counters.perHour, now, hourMs);
  resetCounterIfNeeded(counters.perDay, now, dayMs);

  assertCounterAllowsRequest(counters.perMinute, limits.perMinute, "minute");
  assertCounterAllowsRequest(counters.perHour, limits.perHour, "hour");
  assertCounterAllowsRequest(counters.perDay, limits.perDay, "day");

  counters.perMinute.count += 1;
  counters.perHour.count += 1;
  counters.perDay.count += 1;
}

export function resetOpenAIUsageGuardForTests() {
  counters.perMinute = { count: 0, resetAt: 0 };
  counters.perHour = { count: 0, resetAt: 0 };
  counters.perDay = { count: 0, resetAt: 0 };
}
