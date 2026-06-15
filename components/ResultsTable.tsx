"use client";

import { statusLabel } from "@/lib/verification/rules";
import type { VerificationCheck } from "@/lib/verification/types";

type Props = {
  checks: VerificationCheck[];
};

const badgeClasses = {
  pass: "bg-emerald-100 text-emerald-900 border-emerald-300",
  needs_review: "bg-amber-100 text-amber-950 border-amber-300",
  fail: "bg-red-100 text-red-900 border-red-300"
};

export function ResultsTable({ checks }: Props) {
  return (
    <section aria-labelledby="results-table-heading" className="space-y-3">
      <h2 id="results-table-heading" className="text-lg font-semibold text-slate-950">
        Verification Checklist
      </h2>
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3">
                Check
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                Expected
              </th>
              <th scope="col" className="px-4 py-3">
                Found
              </th>
              <th scope="col" className="px-4 py-3">
                Evidence
              </th>
              <th scope="col" className="px-4 py-3">
                Explanation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {checks.map((check) => (
              <tr key={check.id} className="align-top">
                <th scope="row" className="whitespace-nowrap px-4 py-3 font-semibold text-slate-950">
                  {check.label}
                </th>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${badgeClasses[check.status]}`}
                  >
                    {statusLabel(check.status)}
                  </span>
                </td>
                <td className="max-w-xs px-4 py-3 text-slate-700">{check.expected || "Not provided"}</td>
                <td className="max-w-xs px-4 py-3 text-slate-700">{check.found || "Not found"}</td>
                <td className="max-w-xs px-4 py-3 text-slate-700">{check.evidence || "No snippet"}</td>
                <td className="max-w-sm px-4 py-3 text-slate-700">{check.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
