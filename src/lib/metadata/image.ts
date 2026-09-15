import exifr from "exifr";
import type { GpsCoordinates, MetadataSection } from "@/lib/types";
import { dmsToDecimal, formatBytes, formatValue } from "@/lib/format";
import { hasAiGeneratedMarker } from "./ai";

function pick(
  obj: Record<string, unknown>,
  keys: string[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) out[key] = obj[key];
  }
  return out;
}

function fieldsFrom(
  obj: Record<string, unknown>,
  labels: Record<string, string>
): { label: string; value: string }[] {
  return Object.entries(labels)
    .filter(([k]) => obj[k] !== undefined && obj[k] !== null)
    .map(([k, label]) => ({ label, value: formatValue(obj[k]) }));
}

function allFieldsFrom(obj: Record<string, unknown>): { label: string; value: string }[] {
  return Object.entries(obj)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .filter(([, value]) => !(value instanceof Uint8Array))
    .map(([label, value]) => ({ label, value: formatValue(value) }));
}

export function extractGps(data: Record<string, unknown>): GpsCoordinates | null {
  if (typeof data.latitude === "number" && typeof data.longitude === "number") {
    return { latitude: data.latitude, longitude: data.longitude };
  }
  const lat = data.latitude ?? data.GPSLatitude;
  const lon = data.longitude ?? data.GPSLongitude;
  const latRef = (data.GPSLatitudeRef ?? data.latitudeRef ?? "N") as string;
  const lonRef = (data.GPSLongitudeRef ?? data.longitudeRef ?? "E") as string;

  if (typeof lat === "number" && typeof lon === "number") {
    return { latitude: lat, longitude: lon };
  }

  if (Array.isArray(lat) && Array.isArray(lon) && lat.length >= 3 && lon.length >= 3) {
    return {
      latitude: dmsToDecimal(lat[0], lat[1], lat[2], latRef),
      longitude: dmsToDecimal(lon[0], lon[1], lon[2], lonRef),
    };
  }
  return null;
}

export async function extractImageMetadata(
  file: File
): Promise<{
  sections: MetadataSection[];
  gps: GpsCoordinates | null;
  raw: Record<string, unknown>;
}> {
  const [parsed, gpsBlock] = await Promise.all([
    exifr
      .parse(file, {
        tiff: true,
        exif: true,
        ifd1: true,
        iptc: true,
        xmp: true,
        jfif: true,
        ihdr: true,
        mergeOutput: true,
      })
      .catch(() => ({})),
    exifr.gps(file).catch(() => null),
  ]);

  const exifObj = (parsed ?? {}) as Record<string, unknown>;
  const iptcObj = exifObj;
  const xmpObj = exifObj;
  const gpsObj = (gpsBlock ?? {}) as Record<string, unknown>;

  const merged: Record<string, unknown> = {
    ...exifObj,
    ...iptcObj,
    ...xmpObj,
    ...gpsObj,
  };

  const gps = extractGps({ ...merged, ...gpsObj });

  const deviceFields = fieldsFrom(merged, {
    Make: "Camera make",
    Model: "Camera model",
    LensModel: "Lens",
    Software: "Software",
    Artist: "Artist",
    Copyright: "Copyright",
  });

  const captureFields = fieldsFrom(merged, {
    ISO: "ISO",
    ExposureTime: "Exposure time",
    FNumber: "Aperture (f-number)",
    FocalLength: "Focal length",
    FocalLengthIn35mmFormat: "Focal length (35mm eq.)",
    ExposureProgram: "Exposure program",
    MeteringMode: "Metering mode",
    Flash: "Flash",
    WhiteBalance: "White balance",
    Orientation: "Orientation",
  });

  const locationFields: { label: string; value: string }[] = [];
  if (gps) {
    locationFields.push(
      { label: "Latitude", value: gps.latitude.toFixed(6) },
      { label: "Longitude", value: gps.longitude.toFixed(6) }
    );
  }
  const locKeys: Record<string, string> = {
    GPSAltitude: "Altitude",
    GPSImgDirection: "Image direction",
    Country: "Country",
    City: "City",
    State: "State / region",
    Location: "Location name",
  };
  locationFields.push(...fieldsFrom(merged, locKeys));

  const timestampFields = fieldsFrom(merged, {
    DateTimeOriginal: "Date/time original",
    CreateDate: "Create date",
    ModifyDate: "Modify date",
    DateTimeDigitized: "Digitized",
  });

  const fileFields = [
    { label: "File name", value: file.name },
    { label: "MIME type", value: file.type || "unknown" },
    { label: "File size", value: formatBytes(file.size) },
    { label: "AI generated", value: hasAiGeneratedMarker(merged) ? "Yes" : "No" },
    ...fieldsFrom(merged, {
      ImageWidth: "Image width",
      ImageHeight: "Image height",
      ColorSpace: "Color space",
    }),
  ];
  const allFields = allFieldsFrom(merged).filter(
    ({ label }) => !fileFields.some((field) => field.label === label)
  );

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
    {
      id: "detected",
      title: "All Detected Tags",
      fields: allFields,
      empty: allFields.length === 0,
    },
  ];

  const raw = {
    exif: pick(exifObj, Object.keys(exifObj)),
    iptc: pick(iptcObj, Object.keys(iptcObj)),
    xmp: pick(xmpObj, Object.keys(xmpObj)),
    gps: gpsObj,
  };

  return { sections, gps, raw };
}
