"use client";

import { statusLabel } from "@/lib/verification/rules";
import type { VerificationResult } from "@/lib/verification/types";

type Props = {
  result: VerificationResult;
};

const statusClasses = {
  pass: "border-emerald-300 bg-emerald-50 text-emerald-900",
  needs_review: "border-amber-300 bg-amber-50 text-amber-950",
  fail: "border-red-300 bg-red-50 text-red-900"
};

export function ResultsSummary({ result }: Props) {
  return (
    <section
      className={`rounded-md border p-4 ${statusClasses[result.overallStatus]}`}
      aria-labelledby="results-summary-heading"
    >
      <h2 id="results-summary-heading" className="text-lg font-semibold">
        Overall: {statusLabel(result.overallStatus)}
      </h2>
      <p className="mt-1 text-sm">
        Check completed in {result.processingTimeMs} ms with live extraction.
      </p>
    </section>
  );
}
