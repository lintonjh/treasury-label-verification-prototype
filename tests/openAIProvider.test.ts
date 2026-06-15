import { describe, expect, it } from "vitest";
import { debugResponseBody } from "@/lib/vision/openAIProvider";

describe("OpenAI provider debug redaction", () => {
  it("summarizes response bodies without exposing extracted label text", () => {
    const responseText = JSON.stringify({
      output_text: JSON.stringify({
        rawText: "OLD TOM DISTILLERY 45% Alc./Vol. GOVERNMENT WARNING:",
        brandName: "OLD TOM DISTILLERY",
        evidence: [{ field: "brandName", text: "OLD TOM DISTILLERY" }]
      }),
      output: [{ id: "msg_1" }]
    });

    const debugBody = debugResponseBody(responseText);
    const serialized = JSON.stringify(debugBody);

    expect(debugBody).toMatchObject({
      redacted: true,
      json: true,
      hasOutputText: true,
      outputItemCount: 1
    });
    expect(serialized).not.toContain("OLD TOM DISTILLERY");
    expect(serialized).not.toContain("GOVERNMENT WARNING");
    expect(serialized).not.toContain("45% Alc./Vol.");
  });
});
