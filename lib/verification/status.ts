import type { CheckStatus, VerificationCheck } from "./types";

export function determineOverallStatus(checks: VerificationCheck[]): CheckStatus {
  if (checks.some((check) => check.status === "fail")) {
    return "fail";
  }

  if (checks.some((check) => check.status === "needs_review")) {
    return "needs_review";
  }

  return "pass";
}
