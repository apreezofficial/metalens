"use client";

import { useEffect, useRef } from "react";
import type { GpsCoordinates } from "@/lib/types";

type Props = {
  gps: GpsCoordinates | null;
};

export function LocationMap({ gps }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    if (!gps || !containerRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current).setView(
        [gps.latitude, gps.longitude],
        13
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.marker([gps.latitude, gps.longitude]).addTo(map);
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [gps?.latitude, gps?.longitude, gps]);

  if (!gps) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted">
        No GPS coordinates available for map display.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div ref={containerRef} className="h-64 w-full md:h-80" />
    </div>
  );
}
