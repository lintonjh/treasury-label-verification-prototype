import { afterEach, describe, expect, it } from "vitest";
import { getVisionProvider } from "@/lib/vision/provider";

const originalOpenAIKey = process.env.OPENAI_API_KEY;

describe("getVisionProvider", () => {
  afterEach(() => {
    process.env.OPENAI_API_KEY = originalOpenAIKey;
  });

  it("requires an OpenAI API key for extraction", () => {
    delete process.env.OPENAI_API_KEY;

    expect(() => getVisionProvider()).toThrow("OPENAI_API_KEY is required");
  });

  it("returns the OpenAI provider when an API key is configured", () => {
    process.env.OPENAI_API_KEY = "test-key";

    const resolved = getVisionProvider();

    expect(resolved.mode).toBe("openai");
  });
});
