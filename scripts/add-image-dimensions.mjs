// Adds intrinsic width/height attributes to <img> tags in index.html so the
// browser can reserve space before the image loads (avoids layout shift).
// Run: node scripts/add-image-dimensions.mjs
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const file = path.join(root, "index.html");

const html = await fs.readFile(file, "utf8");
const tags = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
const sizes = new Map();

for (const tag of tags) {
  const src = /src="([^"]+)"/.exec(tag)?.[1];
  if (!src || src.startsWith("data:") || /^https?:/.test(src)) continue;
  if (sizes.has(src)) continue;
  try {
    const meta = await sharp(path.join(root, src)).metadata();
    sizes.set(src, { width: meta.width, height: meta.height });
  } catch {
    sizes.set(src, null);
  }
}

let changed = 0;
let out = html;
for (const tag of tags) {
  if (/\swidth="\d+"/.test(tag) && /\sheight="\d+"/.test(tag)) continue;
  const src = /src="([^"]+)"/.exec(tag)?.[1];
  const size = src && sizes.get(src);
  if (!size?.width || !size?.height) continue;
  const replacement = tag.replace(
    /\s*>$/,
    ` width="${size.width}" height="${size.height}">`
  );
  out = out.replace(tag, replacement);
  changed += 1;
}

await fs.writeFile(file, out);
console.log(`img tags: ${tags.length}, updated: ${changed}`);
for (const [src, size] of sizes) console.log(src, size ? `${size.width}x${size.height}` : "MISSING");
