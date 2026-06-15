import { afterEach, describe, expect, it, vi } from "vitest";
import {
  consumeOpenAIUsageSlot,
  getOpenAIMaxOutputTokens,
  getOpenAIRequestTimeoutMs,
  OpenAIUsageLimitError,
  resetOpenAIUsageGuardForTests
} from "@/lib/vision/usageGuard";

const envKeys = [
  "OPENAI_DEMO_MAX_REQUESTS_PER_DAY",
  "OPENAI_DEMO_MAX_REQUESTS_PER_HOUR",
  "OPENAI_DEMO_MAX_REQUESTS_PER_MINUTE",
  "OPENAI_MAX_OUTPUT_TOKENS",
  "OPENAI_REQUEST_TIMEOUT_MS"
];

afterEach(() => {
  for (const key of envKeys) {
    delete process.env[key];
  }

  resetOpenAIUsageGuardForTests();
  vi.useRealTimers();
});

describe("OpenAI usage guard", () => {
  it("blocks requests after the configured minute limit", () => {
    process.env.OPENAI_DEMO_MAX_REQUESTS_PER_MINUTE = "2";

    consumeOpenAIUsageSlot(1_000);
    consumeOpenAIUsageSlot(2_000);

    expect(() => consumeOpenAIUsageSlot(3_000)).toThrow(OpenAIUsageLimitError);
  });

  it("resets counters after the window expires", () => {
    process.env.OPENAI_DEMO_MAX_REQUESTS_PER_MINUTE = "1";

    consumeOpenAIUsageSlot(1_000);

    expect(() => consumeOpenAIUsageSlot(2_000)).toThrow(OpenAIUsageLimitError);
    expect(() => consumeOpenAIUsageSlot(62_000)).not.toThrow();
  });

  it("uses safe defaults for live demo controls", () => {
    expect(getOpenAIMaxOutputTokens()).toBe(700);
    expect(getOpenAIRequestTimeoutMs()).toBe(20_000);
  });
});
