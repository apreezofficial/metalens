"use client";

import { useCallback, useRef, useState } from "react";
import { ACCEPTED_EXTENSIONS } from "@/lib/types";
import { UploadCloud } from "lucide-react";

type Props = {
  onFiles: (files: FileList | File[]) => void;
  disabled?: boolean;
};

export function UploadZone({ onFiles, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | File[] | null) => {
      if (!list?.length || disabled) return;
      onFiles(list);
    },
    [onFiles, disabled]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
        dragOver
          ? "border-accent bg-accent-muted/30"
          : "border-border bg-card/50 hover:border-zinc-600"
      } ${disabled ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-accent">
        <UploadCloud size={25} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <p className="text-lg font-medium text-foreground">
        Drop files here or click to browse
      </p>
      <p className="mt-2 text-sm text-muted">
        JPG, PNG, HEIC, WebP, MP4, MOV — multiple files supported
      </p>
    </div>
  );
}
