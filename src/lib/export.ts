import { jsPDF } from "jspdf";
import type { MediaFileItem } from "@/lib/types";

export function exportJson(items: MediaFileItem[]): void {
  const payload = items.map((item) => ({
    name: item.name,
    kind: item.kind,
    mimeType: item.mimeType,
    size: item.size,
    gps: item.gps,
    sections: item.sections,
    raw: item.raw,
  }));
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, `metalens-report-${Date.now()}.json`);
}

export function exportPdf(items: MediaFileItem[]): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin;
  const lineHeight = 16;
  const pageHeight = doc.internal.pageSize.getHeight();

  const addLine = (text: string, bold = false) => {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 12 : 10);
    const lines = doc.splitTextToSize(text, 500);
    doc.text(lines, margin, y);
    y += lines.length * lineHeight + (bold ? 4 : 2);
  };

  addLine("MetaLens — Metadata Report", true);
  addLine(`Generated: ${new Date().toISOString()}`);
  addLine("Processed locally in your browser. No data was uploaded.");
  y += 8;

  for (const item of items) {
    addLine(item.name, true);
    addLine(`${item.kind.toUpperCase()} · ${item.mimeType || "unknown"}`);
    if (item.gps) {
      addLine(
        `GPS: ${item.gps.latitude.toFixed(6)}, ${item.gps.longitude.toFixed(6)}`
      );
    }
    for (const section of item.sections) {
      if (section.empty) continue;
      addLine(section.title, true);
      for (const field of section.fields) {
        addLine(`  ${field.label}: ${field.value}`);
      }
    }
    y += 12;
  }

  doc.save(`metalens-report-${Date.now()}.pdf`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
