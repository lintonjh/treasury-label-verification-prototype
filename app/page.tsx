"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ApplicationForm } from "@/components/ApplicationForm";
import { EvidencePanel } from "@/components/EvidencePanel";
import { LabelUploader } from "@/components/LabelUploader";
import { ResultsSummary } from "@/components/ResultsSummary";
import { ResultsTable } from "@/components/ResultsTable";
import { sampleScenarios } from "@/lib/samples/sampleApplication";
import type {
  ApplicationFields,
  VerificationResult
} from "@/lib/verification/types";

const emptyApplication: ApplicationFields = {
  beverageType: "distilled_spirits",
  brandName: "",
  classType: "",
  alcoholContent: "",
  netContents: "",
  bottlerOrProducerName: "",
  bottlerOrProducerAddress: "",
  imported: false,
  countryOfOrigin: ""
};

async function apiMessage(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    const message = payload.error?.message || "The request could not be completed.";
    return payload.error?.requestId ? `${message} Request ID: ${payload.error.requestId}` : message;
  } catch {
    return "The request could not be completed.";
  }
}

function createDownload(result: VerificationResult) {
  const blob = new Blob([JSON.stringify(result, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `treasury-label-verification-${new Date().toISOString()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function LoadingResults() {
  return (
    <section
      className="overflow-hidden rounded-md border border-slate-200 bg-white"
      aria-labelledby="loading-results-heading"
      aria-live="polite"
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 id="loading-results-heading" className="text-lg font-semibold text-slate-950">
          Verifying label
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Extracting visible label evidence and comparing it with the application record.
        </p>
      </div>

      <div className="space-y-4 p-5">
        <div className="h-1 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-treasury-blue" />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="h-20 animate-pulse rounded-md bg-slate-100" />
          <div className="h-20 animate-pulse rounded-md bg-slate-100" />
          <div className="h-20 animate-pulse rounded-md bg-slate-100" />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [application, setApplication] = useState<ApplicationFields>(emptyApplication);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSamplePath, setSelectedSamplePath] = useState("");
  const [applicationFromSample, setApplicationFromSample] = useState(false);
  const sampleLoadId = useRef(0);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const canVerify = useMemo(() => {
    return Boolean(
      file &&
        application.brandName &&
        application.classType &&
        application.alcoholContent &&
        application.netContents &&
        (!application.imported || application.countryOfOrigin)
    );
  }, [application, file]);

  function handleFileChange(nextFile: File | null) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(nextFile);
    setResult(null);
    setError(null);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
  }

  function handleUploadedFileChange(nextFile: File | null) {
    sampleLoadId.current += 1;
    if (applicationFromSample) {
      setApplication(emptyApplication);
    }
    setApplicationFromSample(false);
    setSelectedSamplePath("");
    handleFileChange(nextFile);
  }

  function handleApplicationChange(nextApplication: ApplicationFields) {
    setApplication(nextApplication);
    setApplicationFromSample(false);
    setSelectedSamplePath("");
  }

  async function loadSampleScenario(applicationSample: ApplicationFields, samplePath: string) {
    const loadId = sampleLoadId.current + 1;
    sampleLoadId.current = loadId;
    setError(null);
    setResult(null);
    setApplication(applicationSample);
    setApplicationFromSample(true);
    setSelectedSamplePath(samplePath);

    try {
      const response = await fetch(samplePath);
      if (!response.ok) {
        throw new Error("Sample label could not be loaded.");
      }

      const blob = await response.blob();
      if (sampleLoadId.current !== loadId) {
        return;
      }

      const sampleFile = new File([blob], samplePath.split("/").at(-1) || "sample-label.png", {
        type: "image/png"
      });
      handleFileChange(sampleFile);
    } catch (sampleError) {
      if (sampleLoadId.current !== loadId) {
        return;
      }

      setError(
        sampleError instanceof Error ? sampleError.message : "Sample label could not be loaded."
      );
      setSelectedSamplePath("");
      setApplication(emptyApplication);
      setApplicationFromSample(false);
      handleFileChange(null);
    }
  }

  async function verify() {
    if (!file) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("applicationFields", JSON.stringify(application));

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(await apiMessage(response));
      }

      setResult((await response.json()) as VerificationResult);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-b border-slate-300 pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-treasury-blue">
                Alcohol label review support
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
                Treasury Label Verification Prototype
              </h1>
              <p className="mt-3 max-w-3xl text-base text-slate-700">
                The tool extracts visible label evidence and compares it with the application
                record. Final review decisions remain with the reviewer.
              </p>
            </div>
            <div className="w-full lg:max-w-sm">
              <label
                htmlFor="sample-scenario"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Load Sample Record
              </label>
              <select
                id="sample-scenario"
                value={selectedSamplePath}
                onChange={(event) => {
                  const scenario = sampleScenarios.find(
                    (item) => item.samplePath === event.target.value
                  );

                  if (scenario) {
                    void loadSampleScenario(scenario.application, scenario.samplePath);
                  } else {
                    sampleLoadId.current += 1;
                    setSelectedSamplePath("");
                    setApplication(emptyApplication);
                    setApplicationFromSample(false);
                    handleFileChange(null);
                  }
                }}
                className="min-h-11 w-full rounded-md border border-treasury-blue bg-white px-3 py-2 text-sm font-semibold text-treasury-blue shadow-sm hover:bg-slate-50"
              >
                <option value="">Select a sample record...</option>
                {sampleScenarios.map((scenario) => (
                  <option key={scenario.samplePath} value={scenario.samplePath}>
                    {scenario.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <section
          className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
          aria-labelledby="review-setup-heading"
        >
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 id="review-setup-heading" className="text-lg font-semibold text-slate-950">
              Review Setup
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Confirm the application record, add the label image, then run verification.
            </p>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
            <div className="p-5">
              <ApplicationForm value={application} onChange={handleApplicationChange} />
            </div>

            <div className="border-t border-slate-200 p-5 lg:border-l lg:border-t-0">
              <LabelUploader
                file={file}
                previewUrl={previewUrl}
                onFileChange={handleUploadedFileChange}
              />
            </div>
          </div>

          {error ? (
            <div className="border-t border-slate-200 px-5 py-4">
              <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-900">
                {error}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Verification is available after both the record and label image are ready.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={!canVerify || loading}
                onClick={verify}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-treasury-green px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Verifying label
                  </>
                ) : (
                  "Verify Label"
                )}
              </button>
              {result ? (
                <button
                  type="button"
                  onClick={() => createDownload(result)}
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-400 bg-white px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                >
                  Export JSON Report
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {loading ? (
          <LoadingResults />
        ) : result ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">3. Verification Results</h2>
              <p className="mt-1 text-sm text-slate-600">
                Review matched fields, flagged items, and the extracted evidence used for the
                check.
              </p>
            </div>
            <ResultsSummary result={result} />
            <ResultsTable checks={result.checks} />
            <EvidencePanel
              extractedLabel={result.extractedLabel}
              defaultOpen={result.overallStatus !== "pass"}
            />
          </div>
        ) : (
          <section className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-700">
            <h2 className="text-lg font-semibold text-slate-950">3. Verification Results</h2>
            <p className="mt-1 text-sm text-slate-700">
              Verification results will show matching fields, review flags, and extracted label
              evidence.
            </p>
          </section>
        )}

        <footer className="border-t border-slate-300 py-5 text-sm text-slate-600">
          Privacy note: this app does not store uploaded labels, application fields, extracted
          text, or reports.
        </footer>
      </div>
    </main>
  );
}
