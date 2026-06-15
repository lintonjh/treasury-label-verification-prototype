import type { ExtractedLabel } from "@/lib/verification/types";
import {
  consumeOpenAIUsageSlot,
  getOpenAIMaxOutputTokens,
  getOpenAIRequestTimeoutMs
} from "./usageGuard";
import type { VisionInput, VisionProvider } from "./types";

const openAIEndpoint = "https://api.openai.com/v1/responses";

export class OpenAIProviderError extends Error {
  constructor(
    public readonly status: number,
    public readonly safeMessage: string
  ) {
    super(`OpenAI provider returned ${status}: ${safeMessage}`);
  }
}

function safeOpenAIMessage(rawMessage: string): string {
  try {
    const parsed = JSON.parse(rawMessage) as {
      error?: {
        code?: string;
        message?: string;
        type?: string;
      };
    };

    const parts = [
      parsed.error?.type,
      parsed.error?.code,
      parsed.error?.message
    ].filter(Boolean);

    return parts.join(" - ") || "OpenAI request failed.";
  } catch {
    return rawMessage.slice(0, 500) || "OpenAI request failed.";
  }
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("OpenAI response did not contain JSON.");
  }

  return JSON.parse(match[0]);
}

function asExtractedLabel(value: unknown): ExtractedLabel {
  const candidate = value as Partial<ExtractedLabel>;

  return {
    rawText: typeof candidate.rawText === "string" ? candidate.rawText : "",
    brandName: candidate.brandName,
    classType: candidate.classType,
    alcoholContent: candidate.alcoholContent,
    netContents: candidate.netContents,
    bottlerOrProducerName: candidate.bottlerOrProducerName,
    bottlerOrProducerAddress: candidate.bottlerOrProducerAddress,
    countryOfOrigin: candidate.countryOfOrigin,
    governmentWarning: candidate.governmentWarning,
    evidence: Array.isArray(candidate.evidence)
      ? candidate.evidence
          .filter((item) => item && typeof item.field === "string" && typeof item.text === "string")
          .map((item) => ({
            field: item.field,
            text: item.text,
            confidence: typeof item.confidence === "number" ? item.confidence : undefined
          }))
      : []
  };
}

function debugEnabled(): boolean {
  return process.env.LOG_LEVEL === "debug";
}

function debugImageValue(imageUrl: string): Record<string, unknown> {
  const [prefix, base64 = ""] = imageUrl.split(",");
  return {
    redacted: true,
    reason: "Image bytes are redacted from debug logs.",
    dataUrlPrefix: prefix,
    base64Length: base64.length
  };
}

function debugRequestBody(body: OpenAIResponsesRequestBody): Record<string, unknown> {
  return {
    ...body,
    input: body.input.map((item) => ({
      ...item,
      content: item.content.map((contentItem) =>
        contentItem.type === "input_image"
          ? {
              ...contentItem,
              image_url: debugImageValue(contentItem.image_url)
            }
          : contentItem
      )
    }))
  };
}

export function debugResponseBody(responseText: string): Record<string, unknown> {
  const summary = {
    redacted: true,
    reason: "Provider response body may contain extracted label text.",
    bodyLength: responseText.length
  };

  try {
    const parsed = JSON.parse(responseText) as {
      error?: unknown;
      output?: unknown;
      output_text?: unknown;
    };
    const outputText = typeof parsed.output_text === "string" ? parsed.output_text : undefined;

    return {
      ...summary,
      json: true,
      hasError: Boolean(parsed.error),
      hasOutputText: Boolean(outputText),
      outputTextLength: outputText?.length,
      outputItemCount: Array.isArray(parsed.output) ? parsed.output.length : undefined
    };
  } catch {
    return {
      ...summary,
      json: false
    };
  }
}

function logOpenAIDebug(
  label: string,
  input: VisionInput,
  payload: Record<string, unknown>
) {
  if (!debugEnabled()) {
    return;
  }

  console.info(label, {
    requestId: input.requestId,
    fileName: input.fileName,
    ...payload
  });
}

type OpenAIResponsesRequestBody = {
  model: string;
  max_output_tokens: number;
  safety_identifier?: string;
  temperature: number;
  input: Array<{
    role: "user";
    content: Array<
      | {
          type: "input_text";
          text: string;
        }
      | {
          type: "input_image";
          image_url: string;
        }
    >;
  }>;
};

export class OpenAIVisionProvider implements VisionProvider {
  async extractLabelFields(input: VisionInput): Promise<ExtractedLabel> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";
    const requestBody: OpenAIResponsesRequestBody = {
      model,
      max_output_tokens: getOpenAIMaxOutputTokens(),
      ...(input.safetyIdentifier ? { safety_identifier: input.safetyIdentifier } : {}),
      temperature: 0,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Extract visible alcohol label text and candidate compliance fields. Return only JSON with keys: rawText, brandName, classType, alcoholContent, netContents, bottlerOrProducerName, bottlerOrProducerAddress, countryOfOrigin, governmentWarning, evidence. evidence must be an array of {field,text,confidence}. Do not decide compliance."
            },
            {
              type: "input_image",
              image_url: `data:${input.mimeType};base64,${input.imageBase64}`
            }
          ]
        }
      ]
    };

    logOpenAIDebug("OpenAI request", input, {
      endpoint: openAIEndpoint,
      method: "POST",
      headers: {
        Authorization: "Bearer [redacted]",
        "Content-Type": "application/json"
      },
      body: debugRequestBody(requestBody)
    });

    consumeOpenAIUsageSlot();

    let response: Response;
    try {
      response = await fetch(openAIEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(getOpenAIRequestTimeoutMs())
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new OpenAIProviderError(504, "OpenAI request timed out.");
      }

      throw error;
    }

    const responseText = await response.text();

    logOpenAIDebug("OpenAI response", input, {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      body: debugResponseBody(responseText)
    });

    if (!response.ok) {
      throw new OpenAIProviderError(response.status, safeOpenAIMessage(responseText));
    }

    const data = JSON.parse(responseText);
    const outputText =
      typeof data.output_text === "string"
        ? data.output_text
        : data.output
            ?.flatMap((item: { content?: { text?: string }[] }) => item.content || [])
            .map((content: { text?: string }) => content.text)
            .filter(Boolean)
            .join("\n");

    if (!outputText) {
      throw new Error("OpenAI extraction returned no text output.");
    }

    return asExtractedLabel(extractJson(outputText));
  }
}
