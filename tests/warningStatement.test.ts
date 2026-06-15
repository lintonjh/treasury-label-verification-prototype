import { describe, expect, it } from "vitest";
import { checkGovernmentWarning } from "@/lib/verification/warningStatement";

const exactWarning =
  "GOVERNMENT WARNING: ACCORDING TO THE SURGEON GENERAL, WOMEN SHOULD NOT DRINK ALCOHOLIC BEVERAGES DURING PREGNANCY BECAUSE OF THE RISK OF BIRTH DEFECTS. CONSUMPTION OF ALCOHOLIC BEVERAGES IMPAIRS YOUR ABILITY TO DRIVE A CAR OR OPERATE MACHINERY, AND MAY CAUSE HEALTH PROBLEMS.";

describe("checkGovernmentWarning", () => {
  it("passes the exact all-caps heading and core wording", () => {
    expect(checkGovernmentWarning(exactWarning).status).toBe("pass");
  });

  it("flags title case heading for review", () => {
    expect(checkGovernmentWarning(exactWarning.replace("GOVERNMENT WARNING:", "Government Warning:")).status).toBe(
      "needs_review"
    );
  });

  it("does not pass an exact heading with unrelated warning text", () => {
    expect(checkGovernmentWarning("GOVERNMENT WARNING: PLEASE DRINK RESPONSIBLY.").status).toBe(
      "needs_review"
    );
  });

  it("flags partial required wording for review", () => {
    const partialWarning =
      "GOVERNMENT WARNING: ACCORDING TO THE SURGEON GENERAL, WOMEN SHOULD NOT DRINK ALCOHOLIC BEVERAGES DURING PREGNANCY.";

    expect(checkGovernmentWarning(partialWarning).status).toBe("needs_review");
  });

  it("passes recognizable warning text with OCR-like spacing and punctuation loss", () => {
    const noisyWarning =
      "GOVERNMENT WARNING:\nACCORDING TO THE SURGEON GENERAL WOMEN SHOULD NOT DRINK ALCOHOLIC BEVERAGES DURING PREGNANCY BECAUSE OF THE RISK OF BIRTH DEFECTS CONSUMPTION OF ALCOHOLIC BEVERAGES IMPAIRS YOUR ABILITY TO DRIVE A CAR OR OPERATE MACHINERY AND MAY CAUSE HEALTH PROBLEMS";

    expect(checkGovernmentWarning(noisyWarning).status).toBe("pass");
  });

  it("fails when the warning is missing", () => {
    expect(checkGovernmentWarning("Straight bourbon whiskey 750 mL").status).toBe("fail");
  });
});
