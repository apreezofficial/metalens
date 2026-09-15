# MetaLens

Client-side photo and video metadata viewer. EXIF/IPTC/XMP/GPS for images (via [exifr](https://github.com/MikeKovarik/exifr)) and container/codec details for video (via [MediaInfo.js](https://github.com/buzz/mediainfo.js)). Nothing is uploaded to a server.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — ESLint

## Supported formats

Images: JPG, PNG, HEIC, WebP  
Video: MP4, MOV
