"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MediaFileItem } from "@/lib/types";
import { detectKind, createPreviewUrl, enrichMediaItem } from "@/lib/metadata";
import { exportJson, exportPdf } from "@/lib/export";
import { UploadZone } from "./UploadZone";
import { FileSidebar } from "./FileSidebar";
import { MetadataSections } from "./MetadataSections";
import { LocationMap } from "./LocationMap";

function newId(): string {
  return crypto.randomUUID();
}

export function MetaLensApp() {
  const [items, setItems] = useState<MediaFileItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = useMemo(
    () => items.find((i) => i.id === activeId) ?? items[0] ?? null,
    [items, activeId]
  );

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const newItems: MediaFileItem[] = [];

    for (const file of files) {
      const kind = detectKind(file);
      if (!kind) continue;

      const id = newId();
      const previewUrl = createPreviewUrl(file);
      const base = {
        id,
        file,
        kind,
        previewUrl,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      };

      newItems.push({
        ...base,
        sections: [],
        gps: null,
        raw: {},
        loading: true,
        error: null,
      });
    }

    if (newItems.length === 0) return;

    setItems((prev) => [...prev, ...newItems]);
    setActiveId((prev) => prev ?? newItems[0].id);

    for (const stub of newItems) {
      const enriched = await enrichMediaItem(stub);
      setItems((prev) =>
        prev.map((item) =>
          item.id === stub.id ? { ...item, ...enriched } : item
        )
      );
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = prev.filter((i) => i.id !== id);
      setActiveId((aid) => {
        if (aid !== id) return aid;
        return next[0]?.id ?? null;
      });
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup on unmount only
  }, []);

  const readyItems = items.filter((i) => !i.loading);

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6">
      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">MetaLens</h1>
            <p className="mt-1 max-w-xl text-muted">
              Inspect photo and video metadata in your browser. Processing stays on
              your device — files are never uploaded to a server.
            </p>
          </div>
          {readyItems.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => exportJson(readyItems)}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:border-zinc-600"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => exportPdf(readyItems)}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                Export PDF
              </button>
            </div>
          )}
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-900/50 bg-emerald-950/30 px-3 py-1 text-xs text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Privacy-first: 100% client-side analysis
        </div>
      </header>

      <UploadZone onFiles={addFiles} />

      {items.length > 0 && (
        <div className="mt-8 flex flex-col gap-6 lg:flex-row">
          <FileSidebar
            items={items}
            activeId={active?.id ?? null}
            onSelect={setActiveId}
            onRemove={removeItem}
          />

          {active && (
            <main className="min-w-0 flex-1 space-y-6">
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                {active.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={active.previewUrl}
                    alt={active.name}
                    className="max-h-96 w-full object-contain bg-zinc-950"
                  />
                ) : (
                  <video
                    src={active.previewUrl}
                    controls
                    className="max-h-96 w-full bg-zinc-950"
                  />
                )}
              </div>

              <LocationMap gps={active.gps} />

              <MetadataSections
                sections={active.sections}
                loading={active.loading}
                error={active.error}
              />
            </main>
          )}
        </div>
      )}

      <footer className="mt-auto border-t border-border pt-8 text-center text-xs text-muted">
        <p>
          MetaLens is for informational purposes only. Metadata can be edited or removed;
          do not rely on it for legal or forensic decisions.
        </p>
        <p className="mt-1">© {new Date().getFullYear()} MetaLens — local metadata viewer</p>
      </footer>
    </div>
  );
}
