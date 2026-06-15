import { describe, expect, it } from "vitest";
import { determineOverallStatus } from "@/lib/verification/status";
import type { VerificationCheck } from "@/lib/verification/types";

const baseCheck: VerificationCheck = {
  id: "brand-name",
  label: "Brand Name",
  status: "pass",
  explanation: "Matches."
};

describe("overall status", () => {
  it("returns fail if any check fails", () => {
    expect(determineOverallStatus([baseCheck, { ...baseCheck, id: "warning", status: "fail" }])).toBe(
      "fail"
    );
  });

  it("returns needs review if no checks fail but one needs review", () => {
    expect(
      determineOverallStatus([baseCheck, { ...baseCheck, id: "class-type", status: "needs_review" }])
    ).toBe("needs_review");
  });

  it("returns pass when all checks pass", () => {
    expect(determineOverallStatus([baseCheck, { ...baseCheck, id: "class-type" }])).toBe("pass");
  });

  it("returns pass for an empty checklist", () => {
    expect(determineOverallStatus([])).toBe("pass");
  });
});
