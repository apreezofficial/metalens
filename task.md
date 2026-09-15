# MetaLens — Task Tracker

## Phase 1: Project Setup
- [x] Initialize Next.js (App Router) + TypeScript + Tailwind CSS
- [x] Install dependencies: `exifr`, `mediainfo.js`, `leaflet`, `jspdf`
- [x] Configure Tailwind dark mode default
- [x] Set up project folder structure

## Phase 2: Core Flow (Scaffold First)
- [x] Upload UI: drag-and-drop + file picker (jpg/png/heic/webp/mp4/mov, multiple files)
- [x] Thumbnail/preview generation after upload
- [x] Image metadata extraction with `exifr` (EXIF, IPTC, XMP, GPS)
- [x] Video metadata extraction with `mediainfo.js` (WASM)
- [x] Normalize extracted data into grouped sections
- [x] Display results: Device Info, Capture Settings, Location, File Info, Timestamps
- [x] Sidebar/tabs for multiple files (one file at a time)

## Phase 3: Map & Empty States
- [x] Leaflet map with OpenStreetMap when GPS exists
- [x] "No location/metadata data found" message when stripped/missing

## Phase 4: Export
- [x] Export Report: downloadable JSON
- [x] Export Report: simple PDF summary

## Phase 5: Design & Polish
- [x] Modern minimal dark mode UI with Tailwind
- [x] Privacy-first messaging in UI (client-side only, no server upload)
- [x] Disclaimer footer

## Phase 6: Verification
- [ ] Test image upload + EXIF extraction
- [ ] Test video upload + mediainfo extraction
- [ ] Test export JSON/PDF
- [ ] Te