"use client";

import type { ApplicationFields } from "@/lib/verification/types";

type Props = {
  value: ApplicationFields;
  onChange: (value: ApplicationFields) => void;
};

function updateField<K extends keyof ApplicationFields>(
  value: ApplicationFields,
  key: K,
  nextValue: ApplicationFields[K]
): ApplicationFields {
  return {
    ...value,
    [key]: nextValue
  };
}

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm";
const labelClass = "block text-sm font-medium text-slate-800";

export function ApplicationForm({ value, onChange }: Props) {
  return (
    <section className="space-y-4" aria-labelledby="application-fields-heading">
      <div>
        <h2 id="application-fields-heading" className="text-lg font-semibold text-slate-950">
          1. Application Record
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter the application values the label should match.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>
          Beverage type
          <select
            className={inputClass}
            value={value.beverageType}
            onChange={(event) =>
              onChange(
                updateField(
                  value,
                  "beverageType",
                  event.target.value as ApplicationFields["beverageType"]
                )
              )
            }
          >
            <option value="distilled_spirits">Distilled spirits</option>
            <option value="wine">Wine</option>
            <option value="malt_beverage">Malt beverage</option>
          </select>
        </label>

        <label className={labelClass}>
          Brand name
          <input
            className={inputClass}
            value={value.brandName}
            onChange={(event) => onChange(updateField(value, "brandName", event.target.value))}
            required
          />
        </label>

        <label className={labelClass}>
          Class/type
          <input
            className={inputClass}
            value={value.classType}
            onChange={(event) => onChange(updateField(value, "classType", event.target.value))}
            required
          />
        </label>

        <label className={labelClass}>
          Alcohol content
          <input
            className={inputClass}
            value={value.alcoholContent}
            onChange={(event) =>
              onChange(updateField(value, "alcoholContent", event.target.value))
            }
            placeholder="45% Alc./Vol. (90 Proof)"
            required
          />
        </label>

        <label className={labelClass}>
          Net contents
          <input
            className={inputClass}
            value={value.netContents}
            onChange={(event) => onChange(updateField(value, "netContents", event.target.value))}
            placeholder="750 mL"
            required
          />
        </label>

        <label className={labelClass}>
          Bottler/producer name
          <input
            className={inputClass}
            value={value.bottlerOrProducerName || ""}
            onChange={(event) =>
              onChange(updateField(value, "bottlerOrProducerName", event.target.value))
            }
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          Bottler/producer address
          <input
            className={inputClass}
            value={value.bottlerOrProducerAddress || ""}
            onChange={(event) =>
              onChange(updateField(value, "bottlerOrProducerAddress", event.target.value))
            }
          />
        </label>
      </div>

      <div className="grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-2">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={value.imported}
            onChange={(event) => onChange(updateField(value, "imported", event.target.checked))}
          />
          Imported product
        </label>

        <label className={labelClass}>
          Country of origin
          <input
            className={inputClass}
            value={value.countryOfOrigin || ""}
            disabled={!value.imported}
            onChange={(event) =>
              onChange(updateField(value, "countryOfOrigin", event.target.value))
            }
          />
        </label>
      </div>
    </section>
  );
}
