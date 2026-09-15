import type { MediaKind, MediaFileItem } from "@/lib/types";
import { extractImageMetadata } from "./image";
import { extractVideoMetadata } from "./video";

export function detectKind(file: File): MediaKind | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "heic", "webp"].includes(ext ?? "")) return "image";
  if (["mp4", "mov"].includes(ext ?? "")) return "video";
  return null;
}

export function createPreviewUrl(file: File, kind: MediaKind): string {
  return URL.createObjectURL(file);
}

export async function enrichMediaItem(
  item: Omit<MediaFileItem, "sections" | "gps" | "raw" | "loading" | "error">
): Promise<Pick<MediaFileItem, "sections" | "gps" | "raw" | "loading" | "error">> {
  try {
    if (item.kind === "image") {
      const data = await extractImageMetadata(item.file);
      return { ...data, loading: false, error: null };
    }
    const data = await extractVideoMetadata(item.file);
    return { ...data, loading: false, error: null };
  } catch (e) {
    return {
      sections: [],
      gps: null,
      raw: {},
      loading: false,
      error: e instanceof Error ? e.message : "Failed to read metadata",
    };
  }
}
