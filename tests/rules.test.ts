import { describe, expect, it } from "vitest";
import { sampleApplication, sampleScenarios } from "@/lib/samples/sampleApplication";
import {
  sampleExtractedLabel,
  sampleExtractedLabelsByFileName
} from "./fixtures/sampleExtractedLabel";
import { verifyLabel } from "@/lib/verification/rules";
import type {
  ApplicationFields,
  CheckStatus,
  ExtractedLabel,
  VerificationCheck
} from "@/lib/verification/types";

const governmentWarning =
  "GOVERNMENT WARNING: ACCORDING TO THE SURGEON GENERAL, WOMEN SHOULD NOT DRINK ALCOHOLIC BEVERAGES DURING PREGNANCY BECAUSE OF THE RISK OF BIRTH DEFECTS. CONSUMPTION OF ALCOHOLIC BEVERAGES IMPAIRS YOUR ABILITY TO DRIVE A CAR OR OPERATE MACHINERY, AND MAY CAUSE HEALTH PROBLEMS.";

const baseApplication: ApplicationFields = {
  beverageType: "distilled_spirits",
  brandName: "Federal Test Distillery",
  classType: "Straight Bourbon Whiskey",
  alcoholContent: "45% Alc./Vol. (90 Proof)",
  netContents: "750 mL",
  bottlerOrProducerName: "Federal Test Distillery LLC",
  bottlerOrProducerAddress: "Louisville, Kentucky",
  imported: false,
  countryOfOrigin: ""
};

function makeApplication(overrides: Partial<ApplicationFields> = {}): ApplicationFields {
  return {
    ...baseApplication,
    ...overrides
  };
}

function makeExtractedLabel(overrides: Partial<ExtractedLabel> = {}): ExtractedLabel {
  const values = {
    brandName: "Federal Test Distillery",
    classType: "Straight Bourbon Whiskey",
    alcoholContent: "90 Proof",
    netContents: "0.75 L",
    bottlerOrProducerName: "Federal Test Distillery LLC",
    bottlerOrProducerAddress: "Louisville, Kentucky",
    countryOfOrigin: undefined as string | undefined,
    governmentWarning,
    ...overrides
  };

  const evidence = [
    values.brandName ? { field: "brandName", text: values.brandName } : undefined,
    values.classType ? { field: "classType", text: values.classType } : undefined,
    values.alcoholContent ? { field: "alcoholContent", text: values.alcoholContent } : undefined,
    values.netContents ? { field: "netContents", text: values.netContents } : undefined,
    values.bottlerOrProducerName
      ? { field: "bottlerOrProducerName", text: values.bottlerOrProducerName }
      : undefined,
    values.bottlerOrProducerAddress
      ? { field: "bottlerOrProducerAddress", text: values.bottlerOrProducerAddress }
      : undefined,
    values.countryOfOrigin ? { field: "countryOfOrigin", text: values.countryOfOrigin } : undefined,
    values.governmentWarning ? { field: "governmentWarning", text: values.governmentWarning } : undefined
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return {
    rawText: [
      values.brandName,
      values.classType,
      values.alcoholContent,
      values.netContents,
      values.bottlerOrProducerName,
      values.bottlerOrProducerAddress,
      values.countryOfOrigin,
      values.governmentWarning
    ]
      .filter(Boolean)
      .join("\n"),
    evidence,
    ...values
  };
}

function runVerification(
  application: ApplicationFields = makeApplication(),
  extractedLabel: ExtractedLabel = makeExtractedLabel()
) {
  return verifyLabel({
    application,
    extractedLabel,
    processingTimeMs: 120,
    providerMode: "openai"
  });
}

function checksById(checks: VerificationCheck[]): Record<string, VerificationCheck> {
  return Object.fromEntries(checks.map((check) => [check.id, check]));
}

function expectCheckStatus(checks: VerificationCheck[], id: string, status: CheckStatus) {
  expect(checksById(checks)[id]?.status).toBe(status);
}

describe("verifyLabel", () => {
  it("passes the bundled sample application with the expected checklist", () => {
    const result = verifyLabel({
      application: sampleApplication,
      extractedLabel: sampleExtractedLabel,
      processingTimeMs: 120,
      providerMode: "openai"
    });

    expect(result.overallStatus).toBe("pass");
    expect(result.processingTimeMs).toBe(120);
    expect(result.providerMode).toBe("openai");
    expect(result.checks.map((check) => [check.id, check.status])).toEqual([
      ["brand-name", "pass"],
      ["class-type", "pass"],
      ["alcohol-content", "pass"],
      ["net-contents", "pass"],
      ["government-warning", "pass"],
      ["producer-name", "pass"],
      ["producer-address", "pass"]
    ]);
    expect(checksById(result.checks)["brand-name"].evidence).toBe("OLD TOM DISTILLERY");
  });

  it("marks near brand matches as needs review", () => {
    const result = runVerification(
      makeApplication({
        brandName: "Old Tom Distillery"
      }),
      makeExtractedLabel({
        brandName: "Old Tom Distilling"
      })
    );

    expectCheckStatus(result.checks, "brand-name", "needs_review");
    expect(result.overallStatus).toBe("needs_review");
  });

  it("fails clearly different brand names", () => {
    const result = runVerification(
      makeApplication({
        brandName: "Old Tom Distillery"
      }),
      makeExtractedLabel({
        brandName: "Bay Fog Winery"
      })
    );

    expectCheckStatus(result.checks, "brand-name", "fail");
    expect(result.overallStatus).toBe("fail");
  });

  it("keeps text matches below the pass threshold in review", () => {
    const result = runVerification(
      makeApplication({
        brandName: "ABCDEFGHIJKL"
      }),
      makeExtractedLabel({
        brandName: "ABCDEFGHIJKX"
      })
    );

    expectCheckStatus(result.checks, "brand-name", "needs_review");
  });

  it("fails when a critical check fails", () => {
    const result = runVerification(
      makeApplication(),
      makeExtractedLabel({
        netContents: "375 mL"
      })
    );

    expectCheckStatus(result.checks, "net-contents", "fail");
    expect(result.overallStatus).toBe("fail");
  });

  it("fails missing required extracted fields", () => {
    const result = runVerification(
      makeApplication(),
      makeExtractedLabel({
        classType: undefined,
        alcoholContent: undefined
      })
    );

    expectCheckStatus(result.checks, "class-type", "fail");
    expectCheckStatus(result.checks, "alcohol-content", "fail");
    expect(result.overallStatus).toBe("fail");
  });

  it("omits optional producer checks when the application does not require them", () => {
    const result = runVerification(
      makeApplication({
        bottlerOrProducerName: undefined,
        bottlerOrProducerAddress: undefined
      }),
      makeExtractedLabel({
        bottlerOrProducerName: undefined,
        bottlerOrProducerAddress: undefined
      })
    );

    expect(checksById(result.checks)["producer-name"]).toBeUndefined();
    expect(checksById(result.checks)["producer-address"]).toBeUndefined();
    expect(result.overallStatus).toBe("pass");
  });

  it("fails required producer checks when expected values are missing from extraction", () => {
    const result = runVerification(
      makeApplication(),
      makeExtractedLabel({
        bottlerOrProducerName: undefined,
        bottlerOrProducerAddress: undefined
      })
    );

    expectCheckStatus(result.checks, "producer-name", "fail");
    expectCheckStatus(result.checks, "producer-address", "fail");
    expect(result.overallStatus).toBe("fail");
  });

  it("passes imported labels with a matching country of origin", () => {
    const result = runVerification(
      makeApplication({
        imported: true,
        countryOfOrigin: "Mexico"
      }),
      makeExtractedLabel({
        countryOfOrigin: "Mexico"
      })
    );

    expectCheckStatus(result.checks, "country-of-origin", "pass");
    expect(result.overallStatus).toBe("pass");
  });

  it("requires country of origin for imported labels", () => {
    const result = runVerification(
      makeApplication({
        imported: true,
        countryOfOrigin: "Mexico"
      }),
      makeExtractedLabel({
        countryOfOrigin: undefined
      })
    );

    expectCheckStatus(result.checks, "country-of-origin", "fail");
    expect(result.overallStatus).toBe("fail");
  });

  it("marks near country of origin matches for review", () => {
    const result = runVerification(
      makeApplication({
        imported: true,
        countryOfOrigin: "Czech Republic"
      }),
      makeExtractedLabel({
        countryOfOrigin: "Czech Rep"
      })
    );

    expectCheckStatus(result.checks, "country-of-origin", "needs_review");
    expect(result.overallStatus).toBe("needs_review");
  });

  it("fails mismatched country of origin for imported labels", () => {
    const result = runVerification(
      makeApplication({
        imported: true,
        countryOfOrigin: "Mexico"
      }),
      makeExtractedLabel({
        countryOfOrigin: "Canada"
      })
    );

    expectCheckStatus(result.checks, "country-of-origin", "fail");
    expect(result.overallStatus).toBe("fail");
  });

  it("does not run country of origin checks for domestic labels", () => {
    const result = runVerification(
      makeApplication({
        imported: false,
        countryOfOrigin: ""
      }),
      makeExtractedLabel({
        countryOfOrigin: undefined
      })
    );

    expect(checksById(result.checks)["country-of-origin"]).toBeUndefined();
    expect(result.overallStatus).toBe("pass");
  });

  it("uses raw extracted text as a government warning fallback", () => {
    const result = runVerification(
      makeApplication(),
      makeExtractedLabel({
        governmentWarning: undefined,
        rawText: governmentWarning
      })
    );

    expectCheckStatus(result.checks, "government-warning", "pass");
    expect(result.overallStatus).toBe("pass");
  });

  it("keeps the IPA warning-case sample in needs review", () => {
    const scenario = sampleScenarios.find(
      (item) => item.samplePath === "/samples/pine-trail-ipa-warning-case-label.png"
    );
    const extractedLabel =
      sampleExtractedLabelsByFileName["pine-trail-ipa-warning-case-label.png"];

    expect(scenario).toBeTruthy();
    expect(extractedLabel).toBeTruthy();

    const result = verifyLabel({
      application: scenario?.application || sampleApplication,
      extractedLabel,
      processingTimeMs: 0,
      providerMode: "openai"
    });

    expectCheckStatus(result.checks, "government-warning", "needs_review");
    expect(result.overallStatus).toBe("needs_review");
  });
});
