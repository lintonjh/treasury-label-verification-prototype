"use client";

import type { ExtractedLabel } from "@/lib/verification/types";

type Props = {
  extractedLabel: ExtractedLabel;
  defaultOpen?: boolean;
};

function fieldLabel(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function EvidencePanel({ extractedLabel, defaultOpen = false }: Props) {
  return (
    <details className="group rounded-md border border-slate-200 bg-white" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-lg font-semibold text-slate-950">
            Extracted Label Evidence
          </span>
          <span className="mt-1 block text-sm font-normal text-slate-600">
            View OCR text and field evidence used for this check.
          </span>
        </span>
        <svg
          aria-hidden="true"
          className="mt-1 h-5 w-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </summary>

      <div className="space-y-4 border-t border-slate-200 p-4">
        <details className="rounded-md border border-slate-200 bg-slate-50">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-950">
            Raw Extracted Text
          </summary>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap border-t border-slate-200 bg-white p-4 text-sm text-slate-700">
            {extractedLabel.rawText || "No raw text returned."}
          </pre>
        </details>

        <div>
          <h3 className="text-sm font-semibold text-slate-950">Evidence snippets</h3>
          {extractedLabel.evidence.length > 0 ? (
            <dl className="mt-3 grid gap-3 md:grid-cols-2">
              {extractedLabel.evidence.map((item, index) => (
                <div key={`${item.field}-${index}`} className="rounded-md bg-slate-50 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {fieldLabel(item.field)}
                  </dt>
                  <dd className="mt-1 text-sm text-slate-800">{item.text}</dd>
                  {typeof item.confidence === "number" ? (
                    <dd className="mt-2 text-xs text-slate-500">
                      Extraction confidence: {Math.round(item.confidence * 100)}%
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              No evidence snippets returned.
            </p>
          )}
        </div>
      </div>
    </details>
  );
}
