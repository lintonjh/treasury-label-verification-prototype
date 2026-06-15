import { OpenAIVisionProvider } from "./openAIProvider";
import type { ResolvedVisionProvider } from "./types";

export function getVisionProvider(): ResolvedVisionProvider {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for label extraction.");
  }

  return {
    mode: "openai",
    provider: new OpenAIVisionProvider()
  };
}
