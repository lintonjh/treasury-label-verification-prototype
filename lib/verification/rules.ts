import { alcoholEquivalent } from "./parseAlcohol";
import { checkGovernmentWarning } from "./warningStatement";
import { fuzzyMatch } from "./fuzzyMatch";
import { netContentsEquivalent } from "./parseNetContents";
import { determineOverallStatus } from "./status";
import type {
  ApplicationFields,
  CheckStatus,
  ExtractedLabel,
  VerificationCheck,
  VerificationResult
} from "./types";

function evidenceFor(extracted: ExtractedLabel, field: string): string | undefined {
  return extracted.evidence.find((item) => item.field === field)?.text;
}

function textCheck({
  id,
  label,
  expected,
  found,
  evidence,
  required = true,
  passThreshold = 0.92,
  reviewThreshold = 0.72
}: {
  id: string;
  label: string;
  expected?: string;
  found?: string;
  evidence?: string;
  required?: boolean;
  passThreshold?: number;
  reviewThreshold?: number;
}): VerificationCheck | undefined {
  if (!expected && !required) {
    return undefined;
  }

  if (!found) {
    return {
      id,
      label,
      status: required ? "fail" : "needs_review",
      expected,
      found,
      evidence,
      explanation: `${label} was expected but not found in the extracted label fields.`
    };
  }

  const match = fuzzyMatch(expected, found);

  if (match.exact || match.score >= passThreshold) {
    return {
      id,
      label,
      status: "pass",
      expected,
      found,
      evidence,
      explanation: `${label} matches the expected application value.`
    };
  }

  if (match.score >= reviewThreshold) {
    return {
      id,
      label,
      status: "needs_review",
      expected,
      found,
      evidence,
      explanation: `${label} is close to the expected value and should be reviewed.`
    };
  }

  return {
    id,
    label,
    status: "fail",
    expected,
    found,
    evidence,
    explanation: `${label} does not match the expected application value.`
  };
}

function alcoholCheck(application: ApplicationFields, extracted: ExtractedLabel): VerificationCheck {
  const found = extracted.alcoholContent;

  if (!found) {
    return {
      id: "alcohol-content",
      label: "Alcohol Content",
      status: "fail",
      expected: application.alcoholContent,
      found,
      evidence: evidenceFor(extracted, "alcoholContent"),
      explanation: "Alcohol content was expected but not found in the extracted label fields."
    };
  }

  if (alcoholEquivalent(application.alcoholContent, found)) {
    return {
      id: "alcohol-content",
      label: "Alcohol Content",
      status: "pass",
      expected: application.alcoholContent,
      found,
      evidence: evidenceFor(extracted, "alcoholContent"),
      explanation: "Alcohol content matches after normalizing ABV and proof."
    };
  }

  return {
    id: "alcohol-content",
    label: "Alcohol Content",
    status: "fail",
    expected: application.alcoholContent,
    found,
    evidence: evidenceFor(extracted, "alcoholContent"),
    explanation: "Alcohol content does not match after ABV/proof normalization."
  };
}

function netContentsCheck(application: ApplicationFields, extracted: ExtractedLabel): VerificationCheck {
  const found = extracted.netContents;

  if (!found) {
    return {
      id: "net-contents",
      label: "Net Contents",
      status: "fail",
      expected: application.netContents,
      found,
      evidence: evidenceFor(extracted, "netContents"),
      explanation: "Net contents were expected but not found in the extracted label fields."
    };
  }

  if (netContentsEquivalent(application.netContents, found)) {
    return {
      id: "net-contents",
      label: "Net Contents",
      status: "pass",
      expected: application.netContents,
      found,
      evidence: evidenceFor(extracted, "netContents"),
      explanation: "Net contents match after normalizing liters and milliliters."
    };
  }

  return {
    id: "net-contents",
    label: "Net Contents",
    status: "fail",
    expected: application.netContents,
    found,
    evidence: evidenceFor(extracted, "netContents"),
    explanation: "Net contents do not match after unit normalization."
  };
}

function warningCheck(extracted: ExtractedLabel): VerificationCheck {
  const warning = checkGovernmentWarning(extracted.governmentWarning || extracted.rawText);

  return {
    id: "government-warning",
    label: "Government Health Warning",
    status: warning.status,
    expected: "Required government health warning",
    found: extracted.governmentWarning,
    evidence: evidenceFor(extracted, "governmentWarning"),
    explanation: warning.explanation
  };
}

function countryCheck(application: ApplicationFields, extracted: ExtractedLabel): VerificationCheck | undefined {
  if (!application.imported) {
    return undefined;
  }

  return textCheck({
    id: "country-of-origin",
    label: "Country of Origin",
    expected: application.countryOfOrigin,
    found: extracted.countryOfOrigin,
    evidence: evidenceFor(extracted, "countryOfOrigin"),
    required: true,
    passThreshold: 0.9,
    reviewThreshold: 0.68
  });
}

export function verifyLabel({
  application,
  extractedLabel,
  processingTimeMs,
  providerMode
}: {
  application: ApplicationFields;
  extractedLabel: ExtractedLabel;
  processingTimeMs: number;
  providerMode: "openai";
}): VerificationResult {
  const checks = [
    textCheck({
      id: "brand-name",
      label: "Brand Name",
      expected: application.brandName,
      found: extractedLabel.brandName,
      evidence: evidenceFor(extractedLabel, "brandName"),
      passThreshold: 0.92,
      reviewThreshold: 0.72
    }),
    textCheck({
      id: "class-type",
      label: "Class/Type",
      expected: application.classType,
      found: extractedLabel.classType,
      evidence: evidenceFor(extractedLabel, "classType"),
      passThreshold: 0.9,
      reviewThreshold: 0.65
    }),
    alcoholCheck(application, extractedLabel),
    netContentsCheck(application, extractedLabel),
    warningCheck(extractedLabel),
    textCheck({
      id: "producer-name",
      label: "Bottler/Producer Name",
      expected: application.bottlerOrProducerName,
      found: extractedLabel.bottlerOrProducerName,
      evidence: evidenceFor(extractedLabel, "bottlerOrProducerName"),
      required: Boolean(application.bottlerOrProducerName),
      passThreshold: 0.88,
      reviewThreshold: 0.62
    }),
    textCheck({
      id: "producer-address",
      label: "Bottler/Producer Address",
      expected: application.bottlerOrProducerAddress,
      found: extractedLabel.bottlerOrProducerAddress,
      evidence: evidenceFor(extractedLabel, "bottlerOrProducerAddress"),
      required: Boolean(application.bottlerOrProducerAddress),
      passThreshold: 0.82,
      reviewThreshold: 0.56
    }),
    countryCheck(application, extractedLabel)
  ].filter((check): check is VerificationCheck => Boolean(check));

  return {
    overallStatus: determineOverallStatus(checks),
    checks,
    extractedLabel,
    processingTimeMs,
    providerMode
  };
}

export function statusLabel(status: CheckStatus): string {
  if (status === "needs_review") {
    return "Needs Review";
  }

  return status === "pass" ? "Pass" : "Fail";
}
