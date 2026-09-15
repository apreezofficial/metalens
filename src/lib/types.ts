export type MediaKind = "image" | "video";

export interface MetadataField {
  label: string;
  value: string;
}

export interface MetadataSection {
  id: string;
  title: string;
  fields: MetadataField[];
  empty?: boolean;
}

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

export interface MediaFileItem {
  id: string;
  file: File;
  kind: MediaKind;
  previewUrl: string;
  name: string;
  size: number;
  mimeType: string;
  sections: MetadataSection[];
  gps: GpsCoordinates | null;
  raw: Record<string, unknown>;
  loading: boolean;
  error: string | null;
}

export const ACCEPTED_EXTENSIONS =
  ".jpg,.jpeg,.png,.heic,.webp,.mp4,.mov,.JPG,.JPEG,.PNG,.HEIC,.WEBP,.MP4,.MOV";

export const ACCEPTED_MIME = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
];
