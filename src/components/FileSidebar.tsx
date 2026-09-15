"use client";

import type { MediaFileItem } from "@/lib/types";
import { formatBytes } from "@/lib/format";
import { Film, Image as ImageIcon, X } from "lucide-react";

type Props = {
  items: MediaFileItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
};

export function FileSidebar({ items, activeId, onSelect, onRemove }: Props) {
  if (items.length === 0) return null;

  return (
    <aside className="flex w-full shrink-0 flex-col gap-2 lg:w-56">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Files ({items.length})
      </h2>
      <ul className="flex max-h-48 flex-row gap-2 overflow-x-auto lg:max-h-[calc(100vh-12rem)] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className={`group flex w-full min-w-[140px] items-start gap-2 rounded-lg border p-2 text-left transition-colors lg:min-w-0 ${
                activeId === item.id
                  ? "border-accent bg-accent-muted/40"
                  : "border-border bg-card hover:border-zinc-600"
              }`}
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-900">
                {item.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={item.previewUrl}
                    className="h-full w-full object-cover"
                    muted
                  />
                )}
                <span className="absolute bottom-0 left-0 bg-black/70 p-0.5 text-white">
                  {item.kind === "image" ? <ImageIcon size={11} aria-hidden="true" /> : <Film size={11} aria-hidden="true" />}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted">
                  {item.kind} · {formatBytes(item.size)}
                  {item.loading && " · reading…"}
                </p>
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    onRemove(item.id);
                  }
                }}
                className="shrink-0 rounded p-1 text-xs text-muted opacity-0 transition-opacity hover:bg-zinc-800 hover:text-foreground group-hover:opacity-100"
                aria-label={`Remove ${item.name}`}
              >
                <X size={15} aria-hidden="true" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
