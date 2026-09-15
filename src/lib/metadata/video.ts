import type { GpsCoordinates, MetadataSection } from "@/lib/types";
import { formatBytes, formatValue } from "@/lib/format";

type TrackInfo = {
  "@type"?: string;
  Format?: string;
  Format_Profile?: string;
  CodecID?: string;
  Duration?: string;
  BitRate?: string;
  Width?: string;
  Height?: string;
  FrameRate?: string;
  DisplayAspectRatio?: string;
  ScanType?: string;
  ColorSpace?: string;
  ChromaSubsampling?: string;
  BitDepth?: string;
  StreamSize?: string;
  Language?: string;
  Title?: string;
  Encoded_Date?: string;
  Tagged_Date?: string;
  Make?: string;
  Model?: string;
  Software?: string;
  GPSCoordinates?: string;
  extra?: Record<string, unknown>;
  [key: string]: unknown;
};

function flattenMediaInfo(result: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  const media = result as {
    media?: { track?: TrackInfo[] };
  };
  const tracks = media?.media?.track ?? [];
  for (const track of tracks) {
    const type = track["@type"] ?? "Unknown";
    for (const [key, val] of Object.entries(track)) {
      if (key.startsWith("@") || key === "extra") continue;
      if (val === undefined || val === null || val === "") continue;
      out[`${type}: ${key}`] = formatValue(val);
    }
  }
  return out;
}

function parseGpsFromTracks(tracks: TrackInfo[]): GpsCoordinates | null {
  for (const track of tracks) {
    const coords = track.GPSCoordinates;
    if (typeof coords === "string") {
      const match = coords.match(/([+-]?\d+\.?\d*)\s*([+-]?\d+\.?\d*)/);
      if (match) {
        return {
          latitude: parseFloat(match[1]),
          longitude: parseFloat(match[2]),
        };
      }
    }
  }
  return null;
}

type MediaInfoFactory = (opts?: { format?: string; locateFile?: () => string }) => Promise<{
  analyzeData: (size: number, readChunk: (size: number, offset: number) => Promise<Uint8Array>) => Promise<unknown>;
  close: () => void;
}>;

let mediaInfoFactory: MediaInfoFactory | null = null;

async function getMediaInfo() {
  if (!mediaInfoFactory) {
    const mod = await import("mediainfo.js");
    mediaInfoFactory = mod.default as MediaInfoFactory;
  }
  const instance = await mediaInfoFactory!({
    format: "JSON",
    locateFile: () => "/mediainfo/MediaInfoModule.wasm",
  });
  return instance;
}

export async function extractVideoMetadata(
  file: File
): Promise<{
  sections: MetadataSection[];
  gps: GpsCoordinates | null;
  raw: Record<string, unknown>;
}> {
  const instance = await getMediaInfo();
  try {
    const result = await instance.analyzeData(
      file.size,
      (chunkSize, offset) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(new Uint8Array(reader.result as ArrayBuffer));
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize));
        })
    );

    const parsed =
      typeof result === "string" ? JSON.parse(result) : (result as object);
    const media = parsed as { media?: { track?: TrackInfo[] } };
    const tracks = media?.media?.track ?? [];
    const flat = flattenMediaInfo(parsed);

    const general = tracks.find((t) => t["@type"] === "General") ?? {};
    const video = tracks.find((t) => t["@type"] === "Video") ?? {};
    const audio = tracks.find((t) => t["@type"] === "Audio") ?? {};

    const deviceFields = [
      general.Make && { label: "Make", value: formatValue(general.Make) },
      general.Model && { label: "Model", value: formatValue(general.Model) },
      general.Software && { label: "Software", value: formatValue(general.Software) },
    ].filter(Boolean) as { label: string; value: string }[];

    const captureFields = [
      video.Width && video.Height && {
        label: "Resolution",
        value: `${video.Width} × ${video.Height}`,
      },
      video.FrameRate && { label: "Frame rate", value: formatValue(video.FrameRate) },
      video.DisplayAspectRatio && {
        label: "Aspect ratio",
        value: formatValue(video.DisplayAspectRatio),
      },
      video.ScanType && { label: "Scan type", value: formatValue(video.ScanType) },
      video.Format && { label: "Video codec", value: formatValue(video.Format) },
      video.BitRate && { label: "Video bitrate", value: formatValue(video.BitRate) },
      audio.Format && { label: "Audio codec", value: formatValue(audio.Format) },
      audio.BitRate && { label: "Audio bitrate", value: formatValue(audio.BitRate) },
      audio.Channels && { label: "Audio channels", value: formatValue(audio.Channels) },
    ].filter(Boolean) as { label: string; value: string }[];

    const gps = parseGpsFromTracks(tracks);
    const locationFields = gps
      ? [
          { label: "Latitude", value: gps.latitude.toFixed(6) },
          { label: "Longitude", value: gps.longitude.toFixed(6) },
        ]
      : [];

    const timestampFields = [
      general.Encoded_Date && {
        label: "Encoded",
        value: formatValue(general.Encoded_Date),
      },
      general.Tagged_Date && {
        label: "Tagged",
        value: formatValue(general.Tagged_Date),
      },
    ].filter(Boolean) as { label: string; value: string }[];

    const fileFields = [
      { label: "File name", value: file.name },
      { label: "MIME type", value: file.type || "unknown" },
      { label: "File size", value: formatBytes(file.size) },
      general.Duration && { label: "Duration", value: formatValue(general.Duration) },
      general.Format && { label: "Container", value: formatValue(general.Format) },
      general.OverallBitRate && {
        label: "Overall bitrate",
        value: formatValue(general.OverallBitRate),
      },
    ].filter(Boolean) as { label: string; value: string }[];

    const sections: MetadataSection[] = [
      {
        id: "device",
        title: "Device Info",
        fields: deviceFields,
        empty: deviceFields.length === 0,
      },
      {
        id: "capture",
        title: "Capture Settings",
        fields: captureFields,
        empty: captureFields.length === 0,
      },
      {
        id: "location",
        title: "Location",
        fields: locationFields,
        empty: locationFields.length === 0,
      },
      {
        id: "timestamps",
        title: "Timestamps",
        fields: timestampFields,
        empty: timestampFields.length === 0,
      },
      {
        id: "file",
        title: "File Info",
        fields: fileFields,
        empty: false,
      },
    ];

    return {
      sections,
      gps,
      raw: { mediainfo: flat, tracks: parsed },
    };
  } finally {
    instance.close();
  }
}
