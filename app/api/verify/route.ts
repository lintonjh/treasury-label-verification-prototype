import { NextResponse } from "next/server";
import { z } from "zod";
import { OpenAIProviderError } from "@/lib/vision/openAIProvider";
import { getVisionProvider } from "@/lib/vision/provider";
import { buildSafetyIdentifier } from "@/lib/vision/safetyIdentifier";
import { OpenAIUsageLimitError } from "@/lib/vision/usageGuard";
import { verifyLabel } from "@/lib/verification/rules";
import { applicationFieldsSchema } from "@/lib/verification/types";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const providerErrorMessage =
  "We're having trouble reaching the AI extraction provider. Please try again later or contact an administrator.";

function apiError(code: string, message: string, status = 400, requestId?: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

async function parseApplicationFields(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    throw new Error("Application fields are required.");
  }

  const parsedJson = JSON.parse(value);
  return applicationFieldsSchema.parse(parsedJson);
}

async function parseImage(value: FormDataEntryValue | null) {
  if (!(value instanceof File)) {
    throw new Error("A label image is required.");
  }

  if (!allowedMimeTypes.has(value.type)) {
    throw new Error("Upload a PNG, JPEG, or WebP label image.");
  }

  if (value.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image must be 8 MB or smaller.");
  }

  const buffer = Buffer.from(await value.arrayBuffer());

  return {
    imageBase64: buffer.toString("base64"),
    mimeType: value.type,
    fileName: value.name
  };
}

export async function POST(request: Request) {
  const startedAt = performance.now();
  const requestId = crypto.randomUUID();

  try {
    const formData = await request.formData();
    const application = await parseApplicationFields(formData.get("applicationFields"));
    const image = await parseImage(formData.get("image"));
    const { provider, mode } = getVisionProvider();
    const safetyIdentifier = await buildSafetyIdentifier(request);
    const extractedLabel = await provider.extractLabelFields({
      ...image,
      requestId,
      safetyIdentifier
    });
    const processingTimeMs = Math.round(performance.now() - startedAt);

    return NextResponse.json(
      verifyLabel({
        application,
        extractedLabel,
        processingTimeMs,
        providerMode: mode
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(
        "invalid_application_fields",
        error.issues.map((issue) => issue.message).join(" ")
      );
    }

    if (error instanceof SyntaxError) {
      return apiError("invalid_json", "Application fields must be valid JSON.");
    }

    if (error instanceof OpenAIUsageLimitError) {
      return apiError("provider_usage_limited", error.safeMessage, 429, requestId);
    }

    if (error instanceof OpenAIProviderError) {
      console.error("OpenAI provider error", {
        requestId,
        status: error.status,
        message: error.safeMessage
      });

      return apiError("provider_error", providerErrorMessage, 502, requestId);
    }

    if (error instanceof Error) {
      const isProviderError =
        error.message.includes("OpenAI") || error.message.includes("OPENAI_API_KEY");

      if (isProviderError) {
        console.error("OpenAI provider error", {
          requestId,
          message: error.message
        });
      }

      return apiError(
        isProviderError ? "provider_error" : "invalid_request",
        isProviderError ? providerErrorMessage : error.message,
        isProviderError ? 502 : 400,
        isProviderError ? requestId : undefined
      );
    }

    return apiError("unknown_error", "The label could not be verified.", 500);
  }
}
