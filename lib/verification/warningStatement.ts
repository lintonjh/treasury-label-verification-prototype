import type { CheckStatus } from "./types";
import { fuzzyMatch } from "./fuzzyMatch";
import { normalize } from "./normalize";

const coreWarning =
  "according to the surgeon general women should not drink alcoholic beverages during pregnancy because of the risk of birth defects consumption of alcoholic beverages impairs your ability to drive a car or operate machinery and may cause health problems";

export type WarningCheck = {
  status: CheckStatus;
  explanation: string;
};

export function checkGovernmentWarning(input: string | undefined | null): WarningCheck {
  if (!input || !normalize(input)) {
    return {
      status: "fail",
      explanation: "Government health warning was not found on the extracted label text."
    };
  }

  const hasExactHeading = input.includes("GOVERNMENT WARNING:");
  const hasAnyHeading = /government\s+warning\s*:/i.test(input);
  const normalized = normalize(input);
  const match = fuzzyMatch(coreWarning, normalized);
  const containsKeyPhrases =
    normalized.includes("surgeon general") &&
    normalized.includes("pregnancy") &&
    normalized.includes("drive a car") &&
    normalized.includes("health problems");

  if (hasExactHeading && (match.score >= 0.78 || containsKeyPhrases)) {
    return {
      status: "pass",
      explanation: "Government warning heading and core health warning wording were found."
    };
  }

  if (hasAnyHeading || containsKeyPhrases || match.score >= 0.55) {
    return {
      status: "needs_review",
      explanation:
        "A government warning appears to be present, but capitalization or wording needs human review."
    };
  }

  return {
    status: "fail",
    explanation:
      "Extracted text did not include enough of the required government health warning."
  };
}
