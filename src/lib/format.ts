export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(4).replace(/\.?0+$/, "");
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(formatValue).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function dmsToDecimal(
  degrees: number,
  minutes: number,
  seconds: number,
  ref: string
): number {
  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (ref === "S" || ref === "W") decimal = -decimal;
  return decimal;
}
