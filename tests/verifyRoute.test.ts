import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/verify/route";
import { OpenAIProviderError } from "@/lib/vision/openAIProvider";
import { getVisionProvider } from "@/lib/vision/provider";
import { buildSafetyIdentifier } from "@/lib/vision/safetyIdentifier";
import { OpenAIUsageLimitError } from "@/lib/vision/usageGuard";
import { sampleApplication } from "@/lib/samples/sampleApplication";
import type { VisionProvider } from "@/lib/vision/types";
import { sampleExtractedLabel } from "./fixtures/sampleExtractedLabel";

vi.mock("@/lib/vision/provider", () => ({
  getVisionProvider: vi.fn()
}));

vi.mock("@/lib/vision/safetyIdentifier", () => ({
  buildSafetyIdentifier: vi.fn()
}));

const mockedGetVisionProvider = vi.mocked(getVisionProvider);
const mockedBuildSafetyIdentifier = vi.mocked(buildSafetyIdentifier);

function labelFile(type = "image/png", size = 1): File {
  return new File([new Uint8Array(size)], "label.png", { type });
}

function formRequest(formData: FormData): Request {
  return new Request("http://localhost/api/verify", {
    method: "POST",
    body: formData,
    headers: {
      "user-agent": "vitest"
    }
  });
}

function formData({
  applicationFields = JSON.stringify(sampleApplication),
  image = labelFile()
}: {
  applicationFields?: string;
  image?: File | null;
} = {}): FormData {
  const form = new FormData();
  form.append("applicationFields", applicationFields);

  if (image) {
    form.append("image", image);
  }

  return form;
}

async function responseJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("POST /api/verify", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockedGetVisionProvider.mockReset();
    mockedBuildSafetyIdentifier.mockReset();
  });

  it("returns a verification result from the vision provider", async () => {
    const extractLabelFields = vi.fn<VisionProvider["extractLabelFields"]>();
    extractLabelFields.mockResolvedValue(sampleExtractedLabel);

    mockedGetVisionProvider.mockReturnValue({
      mode: "openai",
      provider: {
        extractLabelFields
      }
    });
    mockedBuildSafetyIdentifier.mockResolvedValue("demo_test_safety");

    const response = await POST(formRequest(formData()));
    const body = await responseJson(response);

    expect(response.status).toBe(200);
    expect(body.overallStatus).toBe("pass");
    expect(body.providerMode).toBe("openai");
    expect(extractLabelFields).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: "label.png",
        mimeType: "image/png",
        safetyIdentifier: "demo_test_safety"
      })
    );
    expect(mockedBuildSafetyIdentifier).toHaveBeenCalledOnce();
  });

  it("rejects invalid application JSON", async () => {
    const response = await POST(
      formRequest(
        formData({
          applicationFields: "{"
        })
      )
    );
    const body = await responseJson(response);

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      error: {
        code: "invalid_json",
        message: "Application fields must be valid JSON."
      }
    });
    expect(mockedGetVisionProvider).not.toHaveBeenCalled();
  });

  it("rejects application fields that fail schema validation", async () => {
    const response = await POST(
      formRequest(
        formData({
          applicationFields: JSON.stringify({
            ...sampleApplication,
            imported: true,
            countryOfOrigin: ""
          })
        })
      )
    );
    const body = await responseJson(response);

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      error: {
        code: "invalid_application_fields",
        message: "Country of origin is required for imported products."
      }
    });
    expect(mockedGetVisionProvider).not.toHaveBeenCalled();
  });

  it("rejects missing label images", async () => {
    const response = await POST(formRequest(formData({ image: null })));
    const body = await responseJson(response);

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      error: {
        code: "invalid_request",
        message: "A label image is required."
      }
    });
    expect(mockedGetVisionProvider).not.toHaveBeenCalled();
  });

  it("rejects unsupported image MIME types", async () => {
    const response = await POST(
      formRequest(
        formData({
          image: labelFile("text/plain")
        })
      )
    );
    const body = await responseJson(response);

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      error: {
        code: "invalid_request",
        message: "Upload a PNG, JPEG, or WebP label image."
      }
    });
    expect(mockedGetVisionProvider).not.toHaveBeenCalled();
  });

  it("rejects oversized label images before provider extraction", async () => {
    const response = await POST(
      formRequest(
        formData({
          image: labelFile("image/png", 8 * 1024 * 1024 + 1)
        })
      )
    );
    const body = await responseJson(response);

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      error: {
        code: "invalid_request",
        message: "Image must be 8 MB or smaller."
      }
    });
    expect(mockedGetVisionProvider).not.toHaveBeenCalled();
  });

  it("returns generic provider errors with a request ID", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const extractLabelFields = vi.fn<VisionProvider["extractLabelFields"]>();
    extractLabelFields.mockRejectedValue(new OpenAIProviderError(503, "Raw provider failure with label text"));

    mockedGetVisionProvider.mockReturnValue({
      mode: "openai",
      provider: {
        extractLabelFields
      }
    });
    mockedBuildSafetyIdentifier.mockResolvedValue("demo_test_safety");

    const response = await POST(formRequest(formData()));
    const body = await responseJson(response);

    expect(response.status).toBe(502);
    expect(body).toMatchObject({
      error: {
        code: "provider_error",
        message:
          "We're having trouble reaching the AI extraction provider. Please try again later or contact an administrator."
      }
    });
    expect((body.error as { requestId?: string }).requestId).toEqual(expect.any(String));
    expect(JSON.stringify(body)).not.toContain("Raw provider failure");
    expect(consoleError).toHaveBeenCalledWith(
      "OpenAI provider error",
      expect.objectContaining({
        status: 503,
        message: "Raw provider failure with label text"
      })
    );
  });

  it("returns usage limit errors as 429 responses", async () => {
    const extractLabelFields = vi.fn<VisionProvider["extractLabelFields"]>();
    extractLabelFields.mockRejectedValue(
      new OpenAIUsageLimitError("Live AI demo limit reached. Please try again later.")
    );

    mockedGetVisionProvider.mockReturnValue({
      mode: "openai",
      provider: {
        extractLabelFields
      }
    });
    mockedBuildSafetyIdentifier.mockResolvedValue("demo_test_safety");

    const response = await POST(formRequest(formData()));
    const body = await responseJson(response);

    expect(response.status).toBe(429);
    expect(body).toMatchObject({
      error: {
        code: "provider_usage_limited",
        message: "Live AI demo limit reached. Please try again later."
      }
    });
    expect((body.error as { requestId?: string }).requestId).toEqual(expect.any(String));
  });
});
