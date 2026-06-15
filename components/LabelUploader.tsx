"use client";

type Props = {
  file: File | null;
  previewUrl: string | null;
  onFileChange: (file: File | null) => void;
};

export function LabelUploader({ file, previewUrl, onFileChange }: Props) {
  return (
    <section className="space-y-4" aria-labelledby="label-upload-heading">
      <div>
        <h2 id="label-upload-heading" className="text-lg font-semibold text-slate-950">
          2. Label Image
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload a PNG, JPEG, or WebP label image. Files are used only for this check and are not
          stored.
        </p>
      </div>

      <label className="block rounded-md border border-dashed border-slate-400 bg-white px-4 py-5 text-sm text-slate-700">
        <span className="font-medium text-slate-950">Choose label image</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="mt-3 block w-full text-sm"
          onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        />
      </label>

      {previewUrl ? (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element -- Blob previews are local user-selected files. */}
          <img
            src={previewUrl}
            alt={file ? `Preview of ${file.name}` : "Sample label preview"}
            className="max-h-[420px] w-full object-contain"
          />
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">
          No label image selected.
        </div>
      )}
    </section>
  );
}
