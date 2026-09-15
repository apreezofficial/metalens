import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "node_modules", "mediainfo.js", "dist", "MediaInfoModule.wasm");
const destDir = path.join(root, "public", "mediainfo");
const dest = path.join(destDir, "MediaInfoModule.wasm");

if (!fs.existsSync(src)) {
  console.warn("[postinstall] mediainfo WASM not found, skip copy");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log("[postinstall] copied MediaInfoModule.wasm to public/mediainfo/");
