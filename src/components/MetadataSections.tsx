"use client";

import type { MetadataSection } from "@/lib/types";

type Props = {
  sections: MetadataSection[];
  loading?: boolean;
  error?: string | null;
};

export function MetadataSections({ sections, loading, error }: Props) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted">
        Extracting metadata…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  const hasAnyData = sections.some((s) => !s.empty && s.fields.length > 0);

  if (!hasAnyData) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="font-medium text-foreground">No embedded metadata found</p>
        <p className="mt-2 text-sm text-muted">
          The file was read successfully, but it contains no EXIF, XMP, IPTC, or GPS tags.
          Screenshots, edited exports, messaging apps, and many PNG files commonly remove
          camera metadata.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map((section) => (
        <section
          key={section.id}
          className="rounded-lg border border-border bg-card p-4"
        >
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            {section.title}
          </h3>
          {section.empty || section.fields.length === 0 ? (
            <p className="text-sm text-muted">No data in this section</p>
          ) : (
            <dl className="space-y-2">
              {section.fields.map((field) => (
                <div key={`${section.id}-${field.label}`} className="grid grid-cols-1 gap-0.5 sm:grid-cols-[minmax(0,40%)_1fr] sm:gap-3">
                  <dt className="text-xs text-muted">{field.label}</dt>
                  <dd className="break-all font-mono text-sm text-foreground">
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      ))}
    </div>
  );
}
